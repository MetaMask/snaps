/* eslint-disable @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-shadow, import/no-unassigned-import */

import { HandlerType } from '@metamask/snaps-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  spy,
} from '@metamask/snaps-utils/test-utils';
import { assertIsJsonRpcSuccess, isPlainObject } from '@metamask/utils';
import { browser } from '@wdio/globals';

import {
  getMockedStreamProvider,
  walkAndSearch,
} from './test-utils/endowments';
import { TestSnapExecutor } from './test-utils/executor';
import { testEndowmentHardening } from './test-utils/hardening';

import 'ses';

const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

describe('BaseSnapExecutor', () => {
  before(() => {
    // @ts-expect-error - `globalThis.process` is not optional.
    delete globalThis.process;

    globalThis.harden = (value) => value;
  });

  const TIMER_ENDOWMENTS = [
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    'console',
  ];

  describe('timers', () => {
    it("doesn't leak execution outside of expected timeshare during initial eval", async () => {
      const CODE = `
        setTimeout(() => { throw new Error('setTimeout executed'); }, 10);
        setInterval(() => { throw new Error('setInterval executed'); }, 10);
      `;

      const executor = new TestSnapExecutor();
      await executor.executeSnap(1, MOCK_SNAP_ID, CODE, TIMER_ENDOWMENTS);

      await sleep(20);

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'OK',
      });

      // If this is empty, it means that the errors aren't being thrown.
      expect(executor.commandBuffer).toHaveLength(0);
    });

    it("doesn't leak execution outside of expected timeshare during RPC calls", async () => {
      // The 25 timeout should run and return a value, but all later timeouts
      // should fail to execute.
      const CODE = `
        exports.onRpcRequest = (() => {
          let resolve;
          const promise = new Promise((r) => { resolve = r; });

          setTimeout(() => resolve('SNAP OK'), 25);
          setTimeout(() => { throw new Error('setTimeout executed'); }, 50);
          setInterval(() => { throw new Error('setInterval executed'); }, 50);

          return promise;
        });
      `;

      const executor = new TestSnapExecutor();
      await executor.executeSnap(1, MOCK_SNAP_ID, CODE, TIMER_ENDOWMENTS);

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
          MOCK_SNAP_ID,
          HandlerType.OnRpcRequest,
          MOCK_ORIGIN,
          { jsonrpc: '2.0', method: '' },
        ],
      });

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 2,
        result: 'SNAP OK',
      });

      await sleep(100);

      // If this is empty, it means that the errors aren't being thrown.
      expect(executor.commandBuffer).toHaveLength(0);
    });
  });

  it('terminates a request when terminate RPC is called', async () => {
    const CODE = `
      exports.onRpcRequest = (() => new Promise(() => ({})));
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
        message: `The snap "${MOCK_SNAP_ID}" has been terminated during execution.`,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
        return ethereum.request({ method: 'eth_blockNumber', params: [] });
      };
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
      module.exports.onRpcRequest = () =>
        ethereum._rpcEngine.handle({ method: 'snap_confirm', params: [] });
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: expect.stringContaining('undefined'),
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

    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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

    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'foo',
    });

    // The executor listens for unhandledrejection events on the `window`
    // object, so we dispatch one here.
    const promise = browser.executeAsync(() => {
      throw new Error('Execute async error.');
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: {
        error: {
          code: -32603,
          data: {
            stack: expect.any(String),
            snapName: MOCK_SNAP_ID,
          },
          message: expect.stringContaining('Execute async error.'),
        },
      },
    });

    await expect(promise).rejects.toThrow('Execute async error.');
  });

  it('notifies execution service of out of band errors via error event', async () => {
    // TODO: Verify that this test is actually testing what it says it is.

    const CODE = `
      module.exports.onRpcRequest = async () => 'foo';
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'foo',
    });

    // The executor listens for error events on the `window` object, so we
    // dispatch one here.
    const promise = browser.execute(() => {
      throw new Error('Execute error.');
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      method: 'UnhandledError',
      params: {
        error: {
          code: -32603,
          data: {
            stack: expect.any(String),
            snapName: MOCK_SNAP_ID,
          },
          message: expect.stringContaining('Execute error.'),
        },
      },
    });

    await expect(promise).rejects.toThrow('Execute error.');
  });

  it('supports onTransaction export', async () => {
    const CODE = `
      module.exports.onTransaction = ({ transaction, chainId, transactionOrigin }) =>
        ({ transaction, chainId, transactionOrigin });
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    // TODO: Update the value to be closer to the value we expect from the
    //  extension. We also have to decide on the shape of that object.
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
        MOCK_SNAP_ID,
        HandlerType.OnTransaction,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
          origin: MOCK_ORIGIN,
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
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
          origin: MOCK_ORIGIN,
          eventName: 'accountsChanged',
        },
      ],
    };

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 2,
      method: 'snapRpc',
      params: [
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
          origin: MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
    const CODE = ``;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.SnapKeyring,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnCronjob,
        MOCK_ORIGIN,
        { jsonrpc: '2.0', method: 'foo', params: ['bar'] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      id: 2,
      jsonrpc: '2.0',
      result: 'bar',
    });
  });

  it('blocks snaps from escaping confinement by using unbound this', async () => {
    const consoleSpy = spy(console, 'log');

    const PAYLOAD = `
      console.log('Payload executed.');
    `;

    const CODE = `
      exports.onRpcRequest = async function() {
        await this.startSnap("payload", \`${PAYLOAD}\`, ['console'])
        return 'Payload has been sent.';
      }
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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

    expect(executor.commandBuffer).toHaveLength(0);
    expect(consoleSpy.calls).not.toContainEqual({
      args: ['Payload executed.'],
      result: undefined,
    });

    consoleSpy.reset();
  });

  it('does not return control to a snap after idle teardown', async () => {
    const consoleSpy = spy(console, 'log');

    const CODE = `
      let promise;

      module.exports.onRpcRequest = async ({request}) => {
        switch (request.method) {
          case 'first':
            promise = ethereum.request({ method: 'eth_blockNumber', params: [] })
              .then(() => console.log('Jailbreak.'));
            return 'First call is ok.';
          case 'second':
            const timeout = new Promise((r) => setTimeout(() => r('Timeout resolved for second call.'), 1000));
            return Promise.race([timeout, promise.then(() => 'Second call is ok.')]);
        }
      }
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, [
      ...TIMER_ENDOWMENTS,
      'ethereum',
    ]);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
      result: 'First call is ok.',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'snapRpc',
      params: [
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
      result: 'Timeout resolved for second call.',
    });

    expect(executor.commandBuffer).toHaveLength(0);
    expect(consoleSpy.calls).not.toContainEqual({
      args: ['Jailbreak.'],
      result: undefined,
    });

    consoleSpy.reset();
  });

  it('does not return control to a snap after idle teardown when request fails', async () => {
    const consoleSpy = spy(console, 'log');

    const CODE = `
      let promise;

      module.exports.onRpcRequest = async ({request}) => {
        switch (request.method) {
          case 'first':
            promise = ethereum.request({ method: 'eth_blockNumber', params: [] })
              .catch(() => console.log('Jailbreak.'));
            return 'First call is ok.';
          case 'second':
            const timeout = new Promise((r) => setTimeout(() => r('Timeout resolved for second call.'), 1000));
            return Promise.race([timeout, promise.then(() => 'Second call is ok.')]);
        }
      }
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, [
      ...TIMER_ENDOWMENTS,
      'ethereum',
    ]);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
      result: 'First call is ok.',
    });

    await executor.writeCommand({
      jsonrpc: '2.0',
      id: 3,
      method: 'snapRpc',
      params: [
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
      result: 'Timeout resolved for second call.',
    });

    expect(executor.commandBuffer).toHaveLength(0);
    expect(consoleSpy.calls).toHaveLength(0);
  });

  it('should handle promise rejection that is passed through the proxy', async () => {
    // This will ensure that the reject(reason); is called from inside the proxy
    // method when the original promise throws an error (i.e., JSON-RPC request
    // fails).
    const CODE = `
      module.exports.onRpcRequest = () =>
        ethereum.request({ method: 'eth_blockNumber', params: [] });
    `;

    const executor = new TestSnapExecutor();
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
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
    await executor.executeSnap(1, MOCK_SNAP_ID, CODE, []);

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
        MOCK_SNAP_ID,
        HandlerType.OnRpcRequest,
        MOCK_ORIGIN,
        { jsonrpc: '2.0', method: '', params: [] },
      ],
    });

    expect(await executor.readCommand()).toStrictEqual({
      jsonrpc: '2.0',
      id: 2,
      result: true,
    });
  });

  describe('hardening', () => {
    before(() => {
      // @ts-expect-error - `globalThis.harden` is not optional.
      delete globalThis.harden;

      lockdown({
        domainTaming: 'unsafe',
        errorTaming: 'unsafe',
        stackFiltering: 'verbose',
      });
    });

    it('hardens the snap and ethereum endowments', async () => {
      const CODE = `
      module.exports.onRpcRequest = () => {
        let result = {
          hasMethods: {},
          errors: [],
        };

        try {
          result.hasMethods = {
            ethereum: {
              request: 'request' in ethereum,
              on: 'on' in ethereum,
              removeListener: 'removeListener' in ethereum,
              rpcEngine: '_rpcEngine' in ethereum,
            },
            snap: {
              request: 'request' in snap,
              on: 'on' in snap,
              removeListener: 'removeListener' in snap,
              rpcEngine: '_rpcEngine' in snap,
              requestType: typeof snap.request,
            }
          }
        } catch (error) {
          result.errors.push(error.message);
        }

        return result;
      }
    `;

      const executor = new TestSnapExecutor();
      await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
          MOCK_SNAP_ID,
          HandlerType.OnRpcRequest,
          MOCK_ORIGIN,
          { jsonrpc: '2.0', method: '', params: [] },
        ],
      });

      expect(await executor.readCommand()).toStrictEqual({
        jsonrpc: '2.0',
        id: 2,
        result: {
          errors: [],
          hasMethods: {
            ethereum: {
              request: true,
              on: true,
              removeListener: true,
              rpcEngine: false,
            },
            snap: {
              request: true,
              on: false,
              removeListener: false,
              rpcEngine: false,
              requestType: 'function',
            },
          },
        },
      });
    });

    ['ethereum', 'snap'].forEach((endowment) => {
      it(`properly hardens ${endowment}`, async () => {
        const CODE = `
        module.exports.onRpcRequest = () => {
          let result = 'ENDOWMENT_SECURED';
          let errors = [];

          try {
            errors = (${testEndowmentHardening})(${endowment}, () => ${endowment});
            if (${endowment}.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
            if (${endowment}.__proto__ && ${endowment}.__proto__.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
            if (${endowment}.prototype && ${endowment}.prototype.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
            const objectProto = Object.getPrototypeOf(${endowment});
            if (objectProto.__flag) {
              result = 'ENDOWMENT_NOT_SECURED';
            }
          } catch (error) {
            return error.message;
          }

          return {
            result: result,
            errors: errors,
          };
        };
      `;

        const executor = new TestSnapExecutor();
        await executor.executeSnap(1, MOCK_SNAP_ID, CODE, ['ethereum']);

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
            MOCK_SNAP_ID,
            HandlerType.OnRpcRequest,
            MOCK_ORIGIN,
            { jsonrpc: '2.0', method: '', params: [] },
          ],
        });

        const command = await executor.readCommand();

        assertIsJsonRpcSuccess(command);
        assert(isPlainObject(command.result));

        expect(command.result.errors).toHaveLength(5);
        expect(command).toStrictEqual({
          jsonrpc: '2.0',
          id: 2,
          result: {
            result: 'ENDOWMENT_SECURED',
            errors: expect.any(Array),
          },
        });
      });
    });

    // This test will ensure that the custom endowment does not leak reference to
    // `globalThis` by using object walker to walk object properties and search
    // for it. Because of the same architectural design of a snap and ethereum
    // endowments, it is enough to test one of them (both are StreamProviders
    // going through proxy).
    it('does not leak `globalThis` in custom endowments', async () => {
      // Because of encapsulation of the endowment implemented in
      // `BaseSnapExecutor`, mocked version is used and will reflect the same use
      // case that is suitable for security auditing of this type.
      const provider = getMockedStreamProvider();
      expect(walkAndSearch(provider, globalThis)).toBe(false);
    });

    it('does not leak real prototype in custom endowments', async () => {
      // Because of encapsulation of the endowment implemented in
      // `BaseSnapExecutor`, mocked version is used and will reflect the same use
      // case that is suitable for security auditing of this type.
      const provider = getMockedStreamProvider();
      expect(Object.getPrototypeOf(provider)).toStrictEqual({});
    });
  });
});
