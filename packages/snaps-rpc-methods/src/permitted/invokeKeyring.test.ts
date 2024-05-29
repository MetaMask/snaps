import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { InvokeKeyringParams } from '@metamask/snaps-sdk';
import { AccountsSnapHandlerType } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type {
  JsonRpcFailure,
  JsonRpcRequest,
  JsonRpcSuccess,
} from '@metamask/utils';

import { invokeKeyringHandler } from './invokeKeyring';

describe('wallet_invokeKeyring', () => {
  describe('invokeKeyringHandler', () => {
    it('has the expected shape', () => {
      expect(invokeKeyringHandler).toMatchObject({
        methodNames: ['wallet_invokeKeyring'],
        implementation: expect.any(Function),
        hookNames: {
          invokeAccountSnap: true,
        },
      });
    });
  });

  describe('invokeKeyringImplementation', () => {
    const getMockHooks = () =>
      ({
        invokeAccountSnap: jest.fn(),
      } as any);

    it('invokes the snap and returns the result', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      hooks.invokeAccountSnap.mockImplementation(() => 'bar');

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<InvokeKeyringParams>,
          res,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'foo' },
          type: AccountsSnapHandlerType.Keyring,
        },
      })) as JsonRpcSuccess<string>;

      expect(response.result).toBe('bar');
      expect(hooks.invokeAccountSnap).toHaveBeenCalledWith({
        request: { method: 'foo' },
        snapId: MOCK_SNAP_ID,
        type: AccountsSnapHandlerType.Keyring,
      });
    });

    it('throws if the params is not an object', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<InvokeKeyringParams>,
          res,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: [],
      })) as JsonRpcFailure;

      expect(response.error.message).toBe(
        'Expected params to be a single object.',
      );
    });
  });
});
