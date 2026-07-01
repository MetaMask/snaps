import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import type { MessengerCallParams } from '@metamask/snaps-sdk';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  getSnapObject,
} from '@metamask/snaps-utils/test-utils';

import type { MessengerCallMethodActions } from './messengerCall';
import { messengerCallHandler } from './messengerCall';
import { SnapEndowments } from '../endowments';
import type { JsonRpcRequestWithOrigin } from '../types';

type FooBarAction = {
  type: 'Foo:bar';
  handler: (parameter: string) => string;
};

describe('snap_messengerCall', () => {
  describe('messengerCallHandler', () => {
    it('has the expected shape', () => {
      expect(messengerCallHandler).toMatchObject({
        implementation: expect.any(Function),
        hookNames: {
          getMessenger: true,
        },
        actionNames: [
          'SnapController:getSnap',
          'PermissionController:getPermission',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = (preinstalled = true) => {
      const messenger = new MockControllerMessenger<
        MessengerCallMethodActions,
        never
      >();

      messenger.registerActionHandler('SnapController:getSnap', () => ({
        ...getSnapObject(),
        preinstalled,
      }));

      messenger.registerActionHandler(
        'PermissionController:getPermission',
        () => ({
          caveats: [
            {
              type: SnapCaveatType.MessengerScopes,
              value: { actions: ['Foo:bar'] },
            },
          ],
          date: 1661166080905,
          id: 'VyAsBJiDDKawv_XlNcm13',
          invoker: MOCK_SNAP_ID,
          parentCapability: SnapEndowments.Messenger,
        }),
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('calls an action', async () => {
      const { implementation } = messengerCallHandler;

      const snapMessenger = new Messenger<MockAnyNamespace, FooBarAction>({
        namespace: MOCK_ANY_NAMESPACE,
      });

      snapMessenger.registerActionHandler('Foo:bar', (arg) => arg);

      const getSnapMessenger = jest.fn().mockReturnValue(snapMessenger);
      const hooks = { getMessenger: getSnapMessenger };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<MessengerCallParams>,
          response,
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
        method: 'snap_messengerCall',
        params: {
          action: 'Foo:bar',
          params: ['baz'],
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'baz',
      });
      expect(getSnapMessenger).toHaveBeenCalledWith(['Foo:bar'], []);
    });

    it('throws an error if the Snap is not preinstalled', async () => {
      const { implementation } = messengerCallHandler;

      const getSnapMessenger = jest.fn();
      const hooks = { getMessenger: getSnapMessenger };

      const messenger = getMessenger(false);

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<MessengerCallParams>,
          response,
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
        method: 'snap_messengerCall',
        params: {
          action: 'Foo:bar',
          params: [],
        },
      });

      expect(getSnapMessenger).not.toHaveBeenCalled();
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      });
    });

    it('throws an error if the Snap does not have the messenger endowment', async () => {
      const { implementation } = messengerCallHandler;

      const getSnapMessenger = jest.fn();
      const hooks = { getMessenger: getSnapMessenger };

      const messenger = getMessenger(true);

      messenger.registerActionHandler(
        'PermissionController:getPermission',
        () => undefined,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<MessengerCallParams>,
          response,
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
        method: 'snap_messengerCall',
        params: {
          action: 'Foo:bar',
          params: [],
        },
      });

      expect(getSnapMessenger).not.toHaveBeenCalled();
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      });
    });

    it.each([
      [
        { foo: 'bar' },
        'Invalid params: At path: action -- Expected a value of type `MessengerAction`, but received: `undefined`.',
      ],
      [
        { action: 1 },
        'Invalid params: At path: action -- Expected a value of type `MessengerAction`, but received: `1`.',
      ],
      [
        { action: 'Foo:bar' },
        'Invalid params: At path: params -- Expected an array value, but received: undefined.',
      ],
    ])(
      'throws an error if the parameters are invalid',
      async (params, error) => {
        const { implementation } = messengerCallHandler;

        const snapMessenger = new Messenger<MockAnyNamespace, FooBarAction>({
          namespace: MOCK_ANY_NAMESPACE,
        });

        snapMessenger.registerActionHandler('Foo:bar', (arg) => arg);

        const getSnapMessenger = jest.fn().mockReturnValue(snapMessenger);

        const callSpy = jest.spyOn(snapMessenger, 'call');

        const hooks = { getMessenger: getSnapMessenger };

        const messenger = getMessenger();

        const engine = new JsonRpcEngine();

        engine.push(createOriginMiddleware(MOCK_SNAP_ID));
        engine.push((request, response, next, end) => {
          const result = implementation(
            request as JsonRpcRequestWithOrigin<MessengerCallParams>,
            response,
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
          method: 'snap_messengerCall',
          params,
        });

        expect(callSpy).not.toHaveBeenCalled();
        expect(response).toStrictEqual({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            message: error,
            stack: expect.any(String),
          },
        });
      },
    );
  });
});
