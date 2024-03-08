import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  RequestPermissionsParams,
  RequestPermissionsResult,
} from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { requestPermissionsHandler } from './requestPermissions';

const mockRequestPermissionReturnValue = [
  {
    'endowment:rpc': {},
    // eslint-disable-next-line @typescript-eslint/naming-convention
    snap_dialog: {},
    'endowment:network-access': {},
    'endowment:webassembly': {},
    'endowment:ethereum-provider': {},
  },
  { id: 'ksoeBAUK_hFowSJt96C_L', origin: 'local:http://localhost:8080' },
];

describe('requestPermissionsHandler', () => {
  it('has the expected shape', () => {
    expect(requestPermissionsHandler).toMatchObject({
      methodNames: ['snap_requestPermissions'],
      implementation: expect.any(Function),
      hookNames: {
        requestPermissions: true,
      },
    });
  });

  describe('implementation', () => {
    it('returns the result received from the `requestPermissions` hook', async () => {
      const { implementation } = requestPermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          dynamicPermissions: {
            'endowment:network-access': {},
          },
        },
      });
      const requestPermissions = jest
        .fn()
        .mockResolvedValue(mockRequestPermissionReturnValue);
      const hooks = {
        getOriginSnap,
        requestPermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestPermissionsParams>,
          response as PendingJsonRpcResponse<RequestPermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestPermissions',
        params: {
          'endowment:network-access': {},
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: mockRequestPermissionReturnValue,
      });
    });

    it('returns an error if params are not specified as a plain object', async () => {
      const { implementation } = requestPermissionsHandler;
      const hooks = {
        getOriginSnap: jest.fn(),
        requestPermissions: jest.fn().mockResolvedValue({}),
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestPermissionsParams>,
          response as PendingJsonRpcResponse<RequestPermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const expectedError = rpcErrors.invalidParams({
        message: 'Invalid method parameter(s).',
      });
      delete expectedError.stack;

      // @ts-expect-error Wrong types are intentional here
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestPermissions',
        params: 'endowment:network-access',
      });
      delete response.error.stack;

      expect(response.error).toMatchObject(expectedError.serialize());
    });

    it('returns an error if a Snap has no dynamic permissions', async () => {
      const { implementation } = requestPermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {},
      });
      const requestPermissions = jest
        .fn()
        .mockResolvedValue(mockRequestPermissionReturnValue);
      const hooks = {
        getOriginSnap,
        requestPermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestPermissionsParams>,
          response as PendingJsonRpcResponse<RequestPermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const expectedError = rpcErrors.invalidRequest({
        message: 'This Snap has no dynamic permissions specified.',
      });
      delete expectedError.stack;

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestPermissions',
        params: {
          'endowment:network-access': {},
        },
      });
      delete response.error.stack;

      expect(response.error).toStrictEqual(expectedError.serialize());
    });

    it('returns an error if a Snap has mismatched dynamic permissions', async () => {
      const { implementation } = requestPermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          dynamicPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_dialog: {},
          },
        },
      });
      const requestPermissions = jest
        .fn()
        .mockResolvedValue(mockRequestPermissionReturnValue);
      const hooks = {
        getOriginSnap,
        requestPermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestPermissionsParams>,
          response as PendingJsonRpcResponse<RequestPermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const expectedError = rpcErrors.invalidRequest({
        message:
          'Requested dynamic permission (endowment:network-access) does not match the allowed dynamic permissions specified in the manifest.',
      });
      delete expectedError.stack;

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestPermissions',
        params: {
          'endowment:network-access': {},
        },
      });
      delete response.error.stack;

      expect(response.error).toStrictEqual(expectedError.serialize());
    });

    it('returns an error if a Snap has mismatched dynamic permission caveats', async () => {
      const { implementation } = requestPermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          dynamicPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_getBip44Entropy: [
              {
                coinType: 3,
              },
            ],
          },
        },
      });
      const requestPermissions = jest
        .fn()
        .mockResolvedValue(mockRequestPermissionReturnValue);
      const hooks = {
        getOriginSnap,
        requestPermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestPermissionsParams>,
          response as PendingJsonRpcResponse<RequestPermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const expectedError = rpcErrors.invalidRequest({
        message:
          'Requested dynamic permission caveats do not match the allowed dynamic permissions caveats for "snap_getBip44Entropy".',
      });
      delete expectedError.stack;

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestPermissions',
        params: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          snap_getBip44Entropy: [
            {
              coinType: 5, // Different coin type specified
            },
          ],
        },
      });
      delete response.error.stack;

      expect(response.error).toStrictEqual(expectedError.serialize());
    });
  });
});
