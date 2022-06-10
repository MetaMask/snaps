// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import { Duplex, DuplexOptions, Readable } from 'stream';
import { JsonRpcRequest } from '../__GENERATED__/openrpc';
import { BaseSnapExecutor } from './BaseSnapExecutor';

const FAKE_ORIGIN = 'origin:foo';
const FAKE_SNAP_NAME = 'local:foo';

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

  private readBuffer: any[] = [];

  private readListeners: ((chunk: any) => void)[] = [];

  constructor() {
    const rpc = new TwoWayPassThrough({
      objectMode: true,
      allowHalfOpen: false,
    });
    const command = new TwoWayPassThrough({
      objectMode: true,
      allowHalfOpen: false,
    });
    rpc.left.on('data', () => {
      /* do nothing */
    });

    super(command.right, rpc.right);

    this.commandLeft = command.left;

    this.commandLeft.on('data', (chunk) => {
      this.readBuffer.push(chunk);
      this.flushReads();
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
      this.readListeners.push(resolve),
    );

    this.flushReads();

    return promise;
  }

  private flushReads() {
    while (this.readBuffer.length && this.readListeners.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chunk = this.readBuffer.shift()!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.readListeners.shift()!(chunk);
    }
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
        exports.onRpcMessage = (() => {
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
        params: [FAKE_SNAP_NAME, FAKE_ORIGIN, { jsonrpc: '2.0', method: '' }],
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
          exports.onRpcMessage = (({ origin, request }) => {
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
          exports.onRpcMessage = (({ origin, request }) => {
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
          params: [SNAP_NAME_1, FAKE_ORIGIN, { jsonrpc: '2.0', method: 'set' }],
        });

        await executor.writeCommand({
          jsonrpc: '2.0',
          id: 4,
          method: 'snapRpc',
          params: [
            SNAP_NAME_1,
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
      exports.onRpcMessage = (() => new Promise(() => ({})));
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

  it('blocks Snaps from escaping confinement by using unbound this', async () => {
    const PAYLOAD = `
    console.error("Hack the planet");
    `;
    const CODE = `
      exports.onRpcMessage = async function() {
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
});
