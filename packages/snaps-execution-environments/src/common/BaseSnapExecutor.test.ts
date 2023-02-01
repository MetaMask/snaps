// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import { HandlerType } from '@metamask/snaps-utils';
import { EventEmitter } from 'stream';

import * as logging from '../logging';
import { TestSnapExecutor } from './test-utils/executor';

const FAKE_ORIGIN = 'origin:foo';
const FAKE_SNAP_NAME = 'local:foo';
const ON_RPC_REQUEST = HandlerType.OnRpcRequest;

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

      await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS);

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

      await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS);

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
  });

  it('terminates a request when terminate RPC is called', async () => {
    const CODE = `
      exports.onRpcRequest = (() => new Promise(() => ({})));
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

  it('reports when outbound requests are made using ethereum', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => ethereum.request({ method: 'eth_blockNumber', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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

  it('reports when outbound requests are made using snap API', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => snap.request({ method: 'wallet_getPermissions', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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

    const walletRequest = await executor.readRpc();
    expect(walletRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'wallet_getPermissions',
        params: [],
      },
    });

    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: walletRequest.data.id!,
        result: [],
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundResponse',
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: [],
    });
  });

  it("doesn't allow snap APIs in the Ethereum provider", async () => {
    const CODE = `
      module.exports.onRpcRequest = () => ethereum.request({ method: 'snap_confirm', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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
      error: {
        code: -32601,
        message: 'The method does not exist / is not available.',
        data: {
          method: 'snap_confirm',
        },
        stack: expect.any(String),
      },
      id: 2,
    });
  });

  it('allows direct access to ethereum public properties', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => {
        const listener = () => undefined;
        ethereum.on('accountsChanged', listener);
        ethereum.removeListener('accountsChanged', listener);
        return ethereum.request({ method: 'eth_blockNumber', params: [] }) };
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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

  it('allows direct access to snap public properties', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => {
        snap.request;
        return snap.request({ method: 'wallet_getSnaps', params: [] }) };
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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

    const getSnapsRequest = await executor.readRpc();
    expect(getSnapsRequest).toStrictEqual({
      name: 'metamask-provider',
      data: {
        id: expect.any(Number),
        jsonrpc: '2.0',
        method: 'wallet_getSnaps',
        params: [],
      },
    });

    const mockSnapsResult = {
      snaps: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'npm:@metamask/example-snap': {
          version: '1.0.0',
        },
      },
    };
    await executor.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: getSnapsRequest.data.id!,
        result: mockSnapsResult,
      },
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'OutboundResponse',
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: mockSnapsResult,
    });
  });

  it("doesn't allow direct access to ethereum internals", async () => {
    const CODE = `
      module.exports.onRpcRequest = () => ethereum._rpcEngine.handle({ method: 'snap_confirm', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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
      error: {
        code: -32603,
        message: "Cannot read properties of undefined (reading 'handle')",
        data: expect.any(Object),
      },
      id: 2,
    });
  });

  it('only allows certain methods in snap API', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => snap.request({ method: 'eth_blockNumber', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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
      error: {
        code: -32603,
        message:
          'The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`.',
        data: {
          originalError: {
            code: 'ERR_ASSERTION',
          },
        },
      },
      id: 2,
    });
  });

  it('only allows certain methods in ethereum API', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => ethereum.request({ method: 'snap_dialog', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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
      error: {
        code: -32601,
        message: 'The method does not exist / is not available.',
        data: {
          method: 'snap_dialog',
        },
        stack: expect.anything(),
      },
      id: 2,
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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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
      module.exports.onTransaction = ({ transaction, chainId, transactionOrigin }) => ({ transaction, chainId, transactionOrigin });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    // TODO: Updating the value to be closer to the value we expect from the extension.
    // We also have to decide on the shape of that object.
    const transaction = { maxFeePerGas: '0x' };

    const params = {
      transaction,
      chainId: 'eip155:1',
      transactionOrigin: null,
    };

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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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
        args: ['foo'],
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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

  it("throws if snap doesn't export keyring", async () => {
    const CODE = `
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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

  it('supports onCronjob export', async () => {
    const CODE = `
      module.exports.onCronjob = ({ request }) => request.params[0];
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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
        HandlerType.OnCronjob,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: 'foo', params: ['bar'] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'bar',
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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);

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
    const logSpy = jest.spyOn(logging, 'log');
    const TIMER_ENDOWMENTS = [
      'setTimeout',
      'clearTimeout',
      'console',
      'ethereum',
    ];
    const CODE = `
      let promise;

      module.exports.onRpcRequest = async ({request}) => {
        switch (request.method) {
          case 'first':
            promise = ethereum.request({ method: 'eth_blockNumber', params: [] })
              .then(() => console.log('Jailbreak'));
            return 'FIRST OK';
          case 'second':
            const timeout = new Promise((r) => setTimeout(() => r('TIMEOUT_RESOLVED_FROM_SECOND_CALL'), 1000));
            return Promise.race([timeout, promise.then(() => 'SECOND OK')]);
        }
      }
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS);

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
    expect(logSpy).toHaveBeenCalledWith(
      'Late promise received after Snap finished execution. Promise will be dropped.',
    );
  });

  it('does not return control to a snap after idle teardown when request fails', async () => {
    jest.useRealTimers();
    const consoleLogSpy = jest.spyOn(console, 'log');
    const logSpy = jest.spyOn(logging, 'log');
    const TIMER_ENDOWMENTS = [
      'setTimeout',
      'clearTimeout',
      'console',
      'ethereum',
    ];
    const CODE = `
      let promise;

      module.exports.onRpcRequest = async ({request}) => {
        switch (request.method) {
          case 'first':
            promise = ethereum.request({ method: 'eth_blockNumber', params: [] })
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
    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, TIMER_ENDOWMENTS);

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
    expect(logSpy).toHaveBeenCalledWith(
      'Late promise received after Snap finished execution. Promise will be dropped.',
    );
  });

  it('should handle promise rejection that is passed through the proxy', async () => {
    // This will ensure that the reject(reason); is called from inside the proxy method
    // when the original promise throws an error (i.e. RPC request fails).
    const CODE = `
      module.exports.onRpcRequest = () => ethereum.request({ method: 'eth_blockNumber', params: [] });
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, ['ethereum']);

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

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);
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
        message: 'Received non-JSON-serializable value.',
      },
    });
  });

  it('contains the self-referential global scopes', async () => {
    const CODE = `
      module.exports.onRpcRequest = () => globalThis !== undefined &&
        globalThis.self === self &&
        globalThis === self.self &&
        globalThis === window &&
        globalThis === global &&
        globalThis === global.global;
    `;
    const executor = new TestSnapExecutor();

    await executor.executeSnap(1, FAKE_SNAP_NAME, CODE, []);
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
      result: true,
    });
  });

  describe('executeSnap', () => {
    it.each([
      {
        snapName: 1,
        code: 'module.exports.onRpcRequest = () => 1;',
        endowments: [],
      },
      {
        snapName: FAKE_SNAP_NAME,
        code: 1,
        endowments: [],
      },
      {
        snapName: FAKE_SNAP_NAME,
        code: 'module.exports.onRpcRequest = () => 1;',
        endowments: ['foo', 1],
      },
      [1, 'module.exports.onRpcRequest = () => 1;', []],
      [FAKE_SNAP_NAME, 1, []],
      [FAKE_SNAP_NAME, 'module.exports.onRpcRequest = () => 1;', ['foo', 1]],
    ])(
      'throws an error if the request arguments are invalid',
      async (params) => {
        const executor = new TestSnapExecutor();

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 1,
          method: 'executeSnap',
          params,
        });

        expect(await executor.readCommand()).toStrictEqual({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            data: expect.any(Object),
            message: expect.any(String),
            stack: expect.any(String),
          },
        });
      },
    );
  });

  describe('snapRpc', () => {
    it.each([
      {
        snapName: 1,
        method: ON_RPC_REQUEST,
        origin: FAKE_ORIGIN,
        request: { jsonrpc: '2.0', method: '', params: [] },
      },
      {
        snapName: FAKE_SNAP_NAME,
        method: 1,
        origin: FAKE_ORIGIN,
        request: { jsonrpc: '2.0', method: '', params: [] },
      },
      {
        snapName: FAKE_SNAP_NAME,
        method: ON_RPC_REQUEST,
        origin: 1,
        request: { jsonrpc: '2.0', method: '', params: [] },
      },
      {
        snapName: FAKE_SNAP_NAME,
        method: ON_RPC_REQUEST,
        origin: FAKE_ORIGIN,
        request: 1,
      },
      [
        1,
        ON_RPC_REQUEST,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
      [
        FAKE_SNAP_NAME,
        1,
        FAKE_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
      [
        FAKE_SNAP_NAME,
        ON_RPC_REQUEST,
        1,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
      [FAKE_SNAP_NAME, ON_RPC_REQUEST, FAKE_ORIGIN, 1],
    ])(
      'throws an error if the request arguments are invalid',
      async (params) => {
        const executor = new TestSnapExecutor();

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 1,
          method: 'snapRpc',
          params,
        });

        expect(await executor.readCommand()).toStrictEqual({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            data: expect.any(Object),
            message: expect.any(String),
            stack: expect.any(String),
          },
        });
      },
    );
  });

  describe('onCommandRequest', () => {
    it('throws a human-readable error if the request arguments are invalid', async () => {
      const executor = new TestSnapExecutor();
      const params = {
        snapName: 1,
        method: ON_RPC_REQUEST,
        origin: FAKE_ORIGIN,
        request: { jsonrpc: '2.0', method: '', params: [] },
      };

      await executor.writeCommand({
        jsonrpc: '2.0',
        id: 1,
        method: 'snapRpc',
        params,
      });

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32602,
          data: expect.any(Object),
          message:
            'Invalid parameters for method "snapRpc": At path: 0 -- Expected a string, but received: 1.',
          stack: expect.any(String),
        },
      });
    });
  });
});
