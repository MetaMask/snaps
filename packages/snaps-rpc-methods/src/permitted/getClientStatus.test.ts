import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import type { GetClientStatusResult } from '@metamask/snaps-sdk';
import { getPlatformVersion } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { GetClientStatusMethodActions } from './getClientStatus';
import { getClientStatusHandler } from './getClientStatus';

describe('snap_getClientStatus', () => {
  describe('getClientStatusHandler', () => {
    it('has the expected shape', () => {
      expect(getClientStatusHandler).toMatchObject({
        implementation: expect.any(Function),
        hookNames: {
          getIsActive: true,
          getVersion: true,
        },
        actionNames: ['KeyringController:getState'],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new Messenger<
        MockAnyNamespace,
        GetClientStatusMethodActions
      >({
        namespace: MOCK_ANY_NAMESPACE,
      });

      messenger.registerActionHandler('KeyringController:getState', () => ({
        isUnlocked: false,
        keyrings: [],
      }));

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns the result', async () => {
      const { implementation } = getClientStatusHandler;

      const getIsActive = jest.fn().mockReturnValue(false);
      const getVersion = jest.fn().mockReturnValue('13.6.0-flask.0');
      const hooks = {
        getIsActive,
        getVersion,
      };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request,
          response as PendingJsonRpcResponse<GetClientStatusResult>,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getClientStatus',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          clientVersion: '13.6.0-flask.0',
          platformVersion: getPlatformVersion(),
          locked: true,
          active: false,
        },
      });
    });
  });
});
