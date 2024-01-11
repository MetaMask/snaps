import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  RevokePermissionsParams,
  RevokePermissionsResult,
} from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { revokePermissionsHandler } from './revokePermissions';

describe('revokePermissionsHandler', () => {
  it('has the expected shape', () => {
    expect(revokePermissionsHandler).toMatchObject({
      methodNames: ['snap_revokePermissions'],
      implementation: expect.any(Function),
      hookNames: {
        revokePermissions: true,
      },
    });
  });

  describe('implementation', () => {
    it('returns the result received from the `revokePermissions` hook', async () => {
      const { implementation } = revokePermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          initialPermissions: {
            'endowment:rpc': { dapps: true },
          },
          dynamicPermissions: {
            'endowment:network-access': {},
          },
        },
      });
      const revokePermissions = jest.fn().mockReturnValueOnce(null);
      const hooks = {
        getOriginSnap,
        revokePermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RevokePermissionsParams>,
          response as PendingJsonRpcResponse<RevokePermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_revokePermissions',
        params: {
          'endowment:network-access': {},
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('returns an error if params are not specified as a plain object', async () => {
      const { implementation } = revokePermissionsHandler;
      const hooks = {
        getOriginSnap: jest.fn(),
        revokePermissions: jest.fn(),
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RevokePermissionsParams>,
          response as PendingJsonRpcResponse<RevokePermissionsResult>,
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

      // @ts-expect-error Passing wrong parameters is intentional here
      // eslint-disable-next-line @typescript-eslint/await-thenable
      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_revokePermissions',
        params: 'wrong param input',
      });
      delete response.error.stack;

      expect(response.error).toMatchObject(expectedError.serialize());
    });

    it('returns an error if a Snap has no dynamic permissions', async () => {
      const { implementation } = revokePermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          initialPermissions: {
            'endowment:rpc': {
              dapps: true,
              snaps: false,
            },
          },
        },
      });
      const revokePermissions = jest.fn().mockReturnValueOnce(null);
      const hooks = {
        getOriginSnap,
        revokePermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RevokePermissionsParams>,
          response as PendingJsonRpcResponse<RevokePermissionsResult>,
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
        method: 'snap_revokePermissions',
        params: {
          'endowment:network-access': {},
        },
      });
      delete response.error.stack;

      expect(response.error).toStrictEqual(expectedError.serialize());
    });

    it('returns an error if a Snap is trying to revoke the initial permissions', async () => {
      const { implementation } = revokePermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          initialPermissions: {
            'endowment:network-access': {},
          },
          dynamicPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_dialog: {},
          },
        },
      });
      const revokePermissions = jest.fn().mockReturnValueOnce(null);
      const hooks = {
        getOriginSnap,
        revokePermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RevokePermissionsParams>,
          response as PendingJsonRpcResponse<RevokePermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const expectedError = rpcErrors.invalidRequest({
        message:
          'A permission (endowment:network-access) requested for revocation is not a dynamic permission.',
      });
      delete expectedError.stack;

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_revokePermissions',
        params: {
          'endowment:network-access': {},
        },
      });
      delete response.error.stack;

      expect(response.error).toStrictEqual(expectedError.serialize());
    });

    it('returns an error if a Snap is trying to revoke a permission that is not on dynamic permissions list', async () => {
      const { implementation } = revokePermissionsHandler;

      const getOriginSnap = jest.fn().mockReturnValue({
        manifest: {
          initialPermissions: {
            'endowment:ethereum-provider': {},
          },
          dynamicPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_dialog: {},
          },
        },
      });
      const revokePermissions = jest.fn().mockReturnValueOnce(null);
      const hooks = {
        getOriginSnap,
        revokePermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RevokePermissionsParams>,
          response as PendingJsonRpcResponse<RevokePermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const expectedError = rpcErrors.invalidRequest({
        message:
          'A permission (endowment:network-access) requested for revocation is not a dynamic permission.',
      });
      delete expectedError.stack;

      const response: any = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_revokePermissions',
        params: {
          'endowment:network-access': {},
        },
      });
      delete response.error.stack;

      expect(response.error).toStrictEqual(expectedError.serialize());
    });
  });
});
