// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import { Duplex, DuplexOptions, EventEmitter, Readable } from 'stream';
import { Json, JsonRpcResponse } from '@metamask/utils';
import { HandlerType } from '@metamask/snap-utils';
import { JsonRpcRequest } from '../__GENERATED__/openrpc';
import { BaseSnapExecutor } from './BaseSnapExecutor';

const FAKE_ORIGIN = 'origin:foo';
const FAKE_SNAP_NAME = 'local:foo';
const ON_RPC_REQUEST = HandlerType.OnRpcRequest;

type TwoWayPassThroughBuffer = {
  buffer: { chunk: any; encoding: BufferEncoding }[];
  canPush: boolean;
};

class TwoWayPassThrough {
  private static flush(bufferData: TwoWayPassThroughBuffer, stream: Readable) {
    while (bufferData.canPush && bufferData.buffer.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { chunk: data, encoding: enc } = bufferData.buffer.shift()!;
      bufferData.canPush = stream.push(data, enc);
    }
  }

  readonly left: Duplex;

  readonly right: Duplex;

  private leftToRight: TwoWayPassThroughBuffer = {
    buffer: [],
    canPush: false,
  };

  private rightToLeft: TwoWayPassThroughBuffer = {
    buffer: [],
    canPush: false,
  };

  constructor(opts?: DuplexOptions) {
    this.left = new Duplex({
      ...opts,
      write: (chunk, encoding, callback) => {
        this.leftToRight.buffer.push({ chunk, encoding });
        TwoWayPassThrough.flush(this.leftToRight, this.right);
        return callback();
      },
      read: () => {
        this.rightToLeft.canPush = true;
        TwoWayPassThrough.flush(this.rightToLeft, this.left);
      },
    });

    this.right = new Duplex({
      ...opts,
      write: (chunk, encoding, callback) => {
        this.rightToLeft.buffer.push({ chunk, encoding });
        TwoWayPassThrough.flush(this.rightToLeft, this.left);
        return callback();
      },
      read: () => {
        this.leftToRight.canPush = true;
        TwoWayPassThrough.flush(this.leftToRight, this.right);
      },
    });
  }
}

class TestSnapExecutor extends BaseSnapExecutor {
  private commandLeft: Duplex;

  private rpcLeft: Duplex;

  private commandBuffer: any[] = [];

  private rpcBuffer: any[] = [];

  private commandListeners: ((chunk: any) => void)[] = [];

  private rpcListeners: ((chunk: any) => void)[] = [];

  constructor() {
    const rpc = new TwoWayPassThrough({
      objectMode: true,
      allowHalfOpen: false,
    });
    const command = new TwoWayPassThrough({
      objectMode: true,
      allowHalfOpen: false,
    });

    super(command.right, rpc.right);

    this.commandLeft = command.left;
    this.rpcLeft = rpc.left;

    this.commandLeft.on('data', (chunk) => {
      this.commandBuffer.push(chunk);
      TestSnapExecutor.flushReads(this.commandBuffer, this.commandListeners);
    });

    this.rpcLeft.on('data', (chunk) => {
      this.rpcBuffer.push(chunk);
      TestSnapExecutor.flushReads(this.rpcBuffer, this.rpcListeners);
    });
  }

  public writeCommand(message: JsonRpcRequest): Promise<void> {
    return new Promise((resolve, reject) =>
      this.commandLeft.write(message, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      }),
    );
  }

  public readCommand(): Promise<JsonRpcRequest> {
    const promise = new Promise<JsonRpcRequest>((resolve) =>
      this.commandListeners.push(resolve),
    );

    TestSnapExecutor.flushReads(this.commandBuffer, this.commandListeners);

    return promise;
  }

  private static flushReads(
    readBuffer: any[],
    listeners: ((chunk: any) => void)[],
  ) {
    while (readBuffer.length && listeners.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chunk = readBuffer.shift()!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      listeners.shift()!(chunk);
    }
  }

  public writeRpc(message: {
    name: string;
    data: JsonRpcResponse<Json>;
  }): Promise<void> {
    return new Promise((resolve, reject) =>
      this.rpcLeft.write(message, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      }),
    );
  }

  public readRpc(): Promise<{ name: string; data: JsonRpcRequest }> {
    const promise = new Promise<{ name: string; data: JsonRpcRequest }>(
      (resolve) => this.rpcListeners.push(resolve),
    );

    TestSnapExecutor.flushReads(this.rpcBuffer, this.rpcListeners);

    return promise;
  }
}

describe('BaseSnapExecutor', () => {
  describe('timers', () => {
    const TIMER_ENDOWMENTS = [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'console',
    ];

    beforeAll(() => {
      jest.useFakeTimers();
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("doesn't leak execution outside of expected timeshare during initial eval", async () => {
      const CODE = `
        setTimeout(() => console.error('setTimeout executed'), 250);
        setInterval(() => console.error('setInterval executed'), 250);
      `;

      const executor = new TestSnapExecutor();
      const consoleErrorSpy = jest.spyOn(console, 'error');

      await executor.writeCommand({
        jsonrpc: '2.0',
        id: 1,
        method: 'executeSnap',
        params: [FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS],
      });

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'OK',
      });

      jest.advanceTimersByTime(250);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("doesn't leak execution outside of expected timeshare during RPC calls", async () => {
      // The 250 timeout should run and return a value, but all later timeouts should fail to execute
      const CODE = `
        exports.onRpcRequest = (() => {
          let resolve;
          const promise = new Promise((r) => { resolve = r; });

          setTimeout(() => resolve('SNAP OK'), 250);
          setTimeout(() => console.error('setTimeout executed'), 500);
          setInterval(() => console.error('setInterval executed'), 500);

          return promise;
        });
      `;

      const executor = new TestSnapExecutor();
      const consoleErrorSpy = jest.spyOn(console, 'error');

      await executor.writeCommand({
        jsonrpc: '2.0',
        id: 1,
        method: 'executeSnap',
        params: [FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS],
      });

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'OK',
      });

      await executor.writeCommand({
        jsonrpc: '2.0',
        id: 2,
        method: 'snapRpc',
        params: [
          FAKE_SNAP_NAME,
          ON_RPC_REQUEST,
          FAKE_ORIGIN,
          { jsonrpc: '2.0', method: '' },
        ],
      });

      jest.advanceTimersByTime(250);

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 2,
        result: 'SNAP OK',
      });

      jest.advanceTimersByTime(250);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it.each(['Timeout', 'Interval'])(
      "can't clear set%s of other snaps",
      async (name: string) => {
        // Since we don't know how the handle looks like we have to actually retrieve it after creating it
        const CODE_1 = `
          let handle;
          exports.onRpcRequest = (({ origin, request }) => {
            switch (request.method) {
              case 'set':
                let resolve;
                const promise = new Promise((r) => { resolve = r; });
                handle = set${name}(() => {
                  clear${name}(handle);
                  resolve('SNAP 1 OK');
                }, 1000);
                return promise;
              case 'getHandle':
                return handle;
            }
          });
        `;
        const CODE_2 = `
          exports.onRpcRequest = (({ origin, request }) => {
            const handle = request.params[0];
            clear${name}(handle);
            return 'SNAP 2 OK';
          })
        `;
        const SNAP_NAME_1 = `${FAKE_SNAP_NAME}_1`;
        const SNAP_NAME_2 = `${FAKE_SNAP_NAME}_2`;

        const executor = new TestSnapExecutor();

        // Initiate the snaps
        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 1,
          method: 'executeSnap',
          params: [SNAP_NAME_1, CODE_1, TIMER_ENDOWMENTS],
        });

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 2,
          method: 'executeSnap',
          params: [SNAP_NAME_2, CODE_2, TIMER_ENDOWMENTS],
        });

        expect(await executor.readCommand()).toStrictEqual({
          jsonrpc: '2.0',
          id: 1,
          result: 'OK',
        });

        expect(await executor.readCommand()).toStrictEqual({
          jsonrpc: '2.0',
          id: 2,
          result: 'OK',
        });

        // The order of below is extremely important!

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 3,
          method: 'snapRpc',
          params: [
            SNAP_NAME_1,
            ON_RPC_REQUEST,
            FAKE_ORIGIN,
            { jsonrpc: '2.0', method: 'set' },
          ],
        });

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 4,
          method: 'snapRpc',
          params: [
            SNAP_NAME_1,
            ON_RPC_REQUEST,
            FAKE_ORIGIN,
            { jsonrpc: '2.0', method: 'getHandle' },
          ],
        });

        const getHandleResult = await executor.readCommand();
        expect(getHandleResult).toStrictEqual(
          expect.objectContaining({
            jsonrpc: '2.0',
            id: 4,
            result: expect.anything(),
          }),
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const handle = getHandleResult!.result;

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 5,
          method: 'snapRpc',
          params: [
            SNAP_NAME_2,
            ON_RPC_REQUEST,
            FAKE_ORIGIN,
            { jsonrpc: '2.0', method: '', params: [handle] },
          ],
        });

        expect(await executor.readCommand()).toStrictEqual({
          jsonrpc: '2.0',
          id: 5,
          result: 'SNAP 2 OK',
        });

        jest.advanceTimersByTime(1000);

        expect(await executor.readCommand()).toStrictEqual({
          jsonrpc: '2.0',
          id: 3,
          result: 'SNAP 1 OK',
        });
      },
    );
  });

  it('terminates a request when terminate RPC is called', async () => {
    const CODE = `
      exports.onRpcRequest = (() => new Promise(() => ({})));
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'terminate',
      params: [],
    });

    // TODO(ritave): Make the test not depend on the return order of id 2 and 3
    expect(await executor.readCommand()).toStrictEqual({
      id: 3,
      jsonrpc: '2.0',
      result: 'OK',
    });

    expect(await executor.readCommand()).toStrictEqual({
      error: {
        code: -32603,
        message: `The snap "${FAKE_SNAP_NAME}" has been terminated during execution.`,
        stack: expect.anything(),
      },
      id: 2,
      jsonrpc: '2.0',
    });
  });

  it('reports when outbound requests are made', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => wallet.request({ method: 'eth_blockNumber', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundRequest',
    });

    const providerRequest = await executor.readRpc();
    expect(providerRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'metamask_getProviderState',
        params: undefined,
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: providerRequest.data.id!,
        result: { isUnlocked: false, accounts: [] },
      },
    });

    const blockNumRequest = await executor.readRpc();
    expect(blockNumRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: blockNumRequest.data.id!,
        result: '0xa70e77',
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundResponse',
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: '0xa70e77',
    });
  });

  it('notifies execution service of out of band errors via unhandledrejection', async () => {
    const CODE = `
    module.exports.onRpcRequest = async () => 'foo';
    `;
    const executor = new TestSnapExecutor();
    const emitter = new EventEmitter();

    jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, listener) =>
        emitter.on(type, listener as any),
      );

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'foo',
    });

    const testError = new Error('test error');
    emitter.emit('unhandledrejection', { reason: testError });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: {
        error: {
          code: -32603,
          data: {
            stack: testError.stack,
            snapName: 'local:foo',
          },
          message: testError.message,
        },
      },
    });
  });

  it('notifies execution service of out of band errors via unhandledrejection when event is error', async () => {
    const CODE = `
    module.exports.onRpcRequest = async () => 'foo';
    `;
    const executor = new TestSnapExecutor();
    const emitter = new EventEmitter();

    jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, listener) =>
        emitter.on(type, listener as any),
      );

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'foo',
    });

    const testError = new Error('test error');
    emitter.emit('unhandledrejection', testError);

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: {
        error: {
          code: -32603,
          data: {
            stack: testError.stack,
            snapName: 'local:foo',
          },
          message: testError.message,
        },
      },
    });
  });

  it('notifies execution service of out of band errors via error', async () => {
    const CODE = `
    module.exports.onRpcRequest = async () => 'foo';
    `;
    const executor = new TestSnapExecutor();
    const emitter = new EventEmitter();

    jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((type, listener) =>
        emitter.on(type, listener as any),
      );

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'foo',
    });

    const testError = new Error('test error');
    emitter.emit('error', { error: testError });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: {
        error: {
          code: -32603,
          data: {
            stack: testError.stack,
            snapName: 'local:foo',
          },
          message: testError.message,
        },
      },
    });
  });

  it('supports onTransaction export', async () => {
    const CODE = `
      module.exports.onTransaction = ({ transaction, chainId }) => ({ transaction, chainId });
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    // TODO: Updating the value to be closer to the value we expect from the extension.
    // We also have to decide on the shape of that object.
    const transaction = { maxFeePerGas: '0x' };

    const params = { transaction, chainId: 'eip155:1' };

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.OnTransaction,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'foo', params },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: params,
    });
  });

  it('supports keyring export', async () => {
    const CODE = `
      class Keyring {
        async handleRequest({request}) {
          switch(request.method){
            case 'eth_signTransaction':
              return request.params;
          }
        }
      }
      module.exports.keyring = new Keyring();
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    const keyringRequest = {
      method: 'handleRequest',
      params: [
        {
          chainId: 'eip155:1',
          origin: FAKE_ORIGIN,
          request: {
            method: 'eth_signTransaction',
            params: { foo: 'bar' },
          },
        },
      ],
    };

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', ...keyringRequest },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: { foo: 'bar' },
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'foo' },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 3,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          originalError: {},
        },
        message: 'Keyring does not expose foo',
      },
    });
  });

  it('supports keyring export with multiple args', async () => {
    const CODE = `
      class Keyring {
        async importAccount(chainId, data) {
          return chainId + ':' + data;
        }
      }
      module.exports.keyring = new Keyring();
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    const keyringRequest = {
      method: 'importAccount',
      params: ['eip155:1', 'foo'],
    };

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', ...keyringRequest },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'eip155:1:foo',
    });
  });

  it('supports keyring export using events', async () => {
    const CODE = `
      class Keyring {

        eventListeners = {};

        async importAccount(chainId, data) {
          const listener = this.eventListeners[chainId + "accountsChanged"];
          if (listener) {
            listener(data);
          }
          return chainId + ':' + data;
        }
        async on({ chainId, origin, eventName }, listener) {
          const id = chainId + eventName;
          this.eventListeners[id] = listener;
        }
      }
      module.exports.keyring = new Keyring();
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    const keyringRequest = {
      method: 'on',
      params: [
        {
          chainId: 'eip155:1',
          origin: FAKE_ORIGIN,
          eventName: 'accountsChanged',
        },
      ],
    };

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', ...keyringRequest },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: null,
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        {
          jsonrpc: '2.0',
          method: 'importAccount',
          params: ['eip155:1', 'foo'],
        },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'SnapKeyringEvent',
      params: {
        args: 'foo',
        data: {
          chainId: 'eip155:1',
          eventName: 'accountsChanged',
          origin: FAKE_ORIGIN,
        },
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 3,
      jsonrpc: '2.0',
      result: 'eip155:1:foo',
    });
  });

  it('supports keyring export with no args', async () => {
    const CODE = `
      class Keyring {
        async getAccounts() {
          return ['eip155:1:foo'];
        }
      }
      module.exports.keyring = new Keyring();
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'getAccounts' },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: ['eip155:1:foo'],
    });
  });

  it('throws if snap doesnt export keyring', async () => {
    const CODE = `
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        HandlerType.SnapKeyring,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'foo' },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          originalError: {},
        },
        message: 'Keyring not exported',
      },
    });
  });

  it('blocks Snaps from escaping confinement by using unbound this', async () => {
    const PAYLOAD = `
    console.error("Hack the planet");
    `;
    const CODE = `
      exports.onRpcRequest = async function() {
        await this.startSnap("payload", \`${PAYLOAD}\`, ['console'])
        return 'PAYLOAD SENT';
      }
    `;

    const executor = new TestSnapExecutor();

    const consoleErrorSpy = jest.spyOn(console, 'error');

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 2,
      error: {
        code: -32603,
        data: expect.anything(),
        message: expect.stringContaining('undefined'),
      },
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('does not return control to a snap after idle teardown', async () => {
    jest.useRealTimers();
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleWarnSpy = jest.spyOn(console, 'warn');
    const TIMER_ENDOWMENTS = ['setTimeout', 'clearTimeout', 'console'];
    const CODE = `
      let promise;

      module.exports.onRpcRequest = async ({request}) => {
        switch (request.method) {
          case 'first':
            promise = wallet.request({ method: 'eth_blockNumber', params: [] })
              .then(() => console.log('Jailbreak'));
            return 'FIRST OK';
          case 'second':
            const timeout = new Promise((r) => setTimeout(() => r('TIMEOUT_RESOLVED_FROM_SECOND_CALL'), 1000));
            return Promise.race([timeout, promise.then(() => 'SECOND OK')]);
        }
      }
    `;
    const executor = new TestSnapExecutor();

    // --- Execute Snap
    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    // --- Call Snap RPC
    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'first', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundRequest',
    });

    const providerRequest = await executor.readRpc();
    expect(providerRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'metamask_getProviderState',
        params: undefined,
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: providerRequest.data.id!,
        result: { isUnlocked: false, accounts: [] },
      },
    });

    const blockNumRequest = await executor.readRpc();
    expect(blockNumRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'FIRST OK',
    });

    // --- Call Snap RPC for the second time
    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'second', params: [] },
      ],
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: blockNumRequest.data.id!,
        result: '0xa70e77',
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 3,
      jsonrpc: '2.0',
      result: 'TIMEOUT_RESOLVED_FROM_SECOND_CALL',
    });

    expect(consoleLogSpy).not.toHaveBeenCalledWith('Jailbreak');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Late promise received after Snap finished execution. Promise will be dropped.',
    );
  });

  it('does not return control to a snap after idle teardown when request fails', async () => {
    jest.useRealTimers();
    const consoleLogSpy = jest.spyOn(console, 'log');
    const consoleWarnSpy = jest.spyOn(console, 'warn');
    const TIMER_ENDOWMENTS = ['setTimeout', 'clearTimeout', 'console'];
    const CODE = `
      let promise;

      module.exports.onRpcRequest = async ({request}) => {
        switch (request.method) {
          case 'first':
            promise = wallet.request({ method: 'eth_blockNumber', params: [] })
              .catch(() => console.log('Jailbreak'));
            return 'FIRST OK';
          case 'second':
            const timeout = new Promise((r) => setTimeout(() => r('TIMEOUT_RESOLVED_FROM_SECOND_CALL'), 1000));
            return Promise.race([timeout, promise.then(() => 'SECOND OK')]);
        }
      }
    `;
    const executor = new TestSnapExecutor();

    // --- Execute Snap
    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    // --- Call Snap RPC
    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'first', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundRequest',
    });

    const providerRequest = await executor.readRpc();
    expect(providerRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'metamask_getProviderState',
        params: undefined,
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: providerRequest.data.id!,
        result: { isUnlocked: false, accounts: [] },
      },
    });

    const blockNumRequest = await executor.readRpc();
    expect(blockNumRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'FIRST OK',
    });

    // --- Call Snap RPC for the second time
    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'second', params: [] },
      ],
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: blockNumRequest.data.id!,
        error: {
          message: 'Error in RPC request',
          code: -1000,
        },
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 3,
      jsonrpc: '2.0',
      result: 'TIMEOUT_RESOLVED_FROM_SECOND_CALL',
    });

    expect(consoleLogSpy).not.toHaveBeenCalledWith('Jailbreak');
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Late promise received after Snap finished execution. Promise will be dropped.',
    );
  });

  it('should handle promise rejection that is passed through the proxy', async () => {
    // This will ensure that the reject(reason); is called from inside the proxy method
    // when the original promise throws an error (i.e. RPC request fails).
    const CODE = `
      module.exports.onRpcRequest = () => wallet.request({ method: 'eth_blockNumber', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundRequest',
    });

    const providerRequest = await executor.readRpc();
    expect(providerRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'metamask_getProviderState',
        params: undefined,
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: providerRequest.data.id!,
        result: { isUnlocked: false, accounts: [] },
      },
    });

    const blockNumRequest = await executor.readRpc();
    expect(blockNumRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: blockNumRequest.data.id!,
        error: {
          message: 'Error in RPC request. Cannot get block number.',
          code: -1000,
        },
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundResponse',
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      error: expect.anything(),
    });
  });

  it('throws when trying to respond with unserializable values', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => BigInt(0);
    `;
    const executor = new TestSnapExecutor();

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 1,
      method: 'executeSnap',
      params: [FAKE_SNAP_NAME, CODE, []],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 2,
      error: {
        code: -32603,
        data: expect.any(Object),
        message: 'JSON-RPC responses must be JSON serializable objects.',
      },
    });
  });
});
