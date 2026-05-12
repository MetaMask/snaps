import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import type { TrackEventParams, TrackEventResult } from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  getSnapObject,
} from '@metamask/snaps-utils/test-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { TrackEventMethodActions } from './trackEvent';
import { trackEventHandler } from './trackEvent';
import type { JsonRpcRequestWithOrigin } from '../types';

/* eslint-disable @typescript-eslint/naming-convention */
describe('snap_trackEvent', () => {
  describe('trackEventHandler', () => {
    it('has the expected shape', () => {
      expect(trackEventHandler).toMatchObject({
        implementation: expect.any(Function),
        hookNames: {
          trackEvent: true,
        },
        actionNames: ['SnapController:getSnap'],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = (preinstalled = true) => {
      const messenger = new MockControllerMessenger<
        TrackEventMethodActions,
        never
      >();

      messenger.registerActionHandler('SnapController:getSnap', () => ({
        ...getSnapObject(),
        preinstalled,
      }));

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('tracks an event with no properties', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {
            event: 'test_event',
          },
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
      expect(trackEvent).toHaveBeenCalledWith({
        event: 'test_event',
      });
    });

    it('tracks an event with properties', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {
            event: 'test_event',
            properties: {
              user_action: 'click',
              button_name: 'submit',
            },
          },
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
      expect(trackEvent).toHaveBeenCalledWith({
        event: 'test_event',
        properties: {
          user_action: 'click',
          button_name: 'submit',
        },
      });
    });

    it('tracks an event with sensitive properties', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {
            event: 'test_event',
            sensitiveProperties: {
              wallet_address: '0x123',
              transaction_hash: '0xabc',
            },
          },
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
      expect(trackEvent).toHaveBeenCalledWith({
        event: 'test_event',
        sensitiveProperties: {
          wallet_address: '0x123',
          transaction_hash: '0xabc',
        },
      });
    });

    it('throws on properties with non-snake_case keys', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {
            event: 'test_event',
            properties: {
              userAction: 'click',
              ButtonName: 'submit',
            },
          },
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: All property keys must be in snake_case format. The following key contains invalid properties: "properties".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it('throws on sensitive properties with non-snake_case keys', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {
            event: 'test_event',
            sensitiveProperties: {
              walletAddress: '0x123',
              transactionHash: '0xabc',
            },
          },
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: All property keys must be in snake_case format. The following key contains invalid properties: "sensitiveProperties".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it('throws on missing event name', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {},
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: event.event -- Expected a string, but received: undefined.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
      expect(trackEvent).not.toHaveBeenCalled();
    });

    it('throws if non-preinstalled snap is calling the method', async () => {
      const { implementation } = trackEventHandler;

      const trackEvent = jest.fn();
      const hooks = { trackEvent };

      const messenger = getMessenger(false);

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<TrackEventParams>,
          response as PendingJsonRpcResponse<TrackEventResult>,
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
        method: 'snap_trackEvent',
        params: {
          event: {
            event: 'test_event',
            properties: {
              user_action: 'click',
              button_name: 'submit',
            },
          },
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32601,
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
      expect(trackEvent).not.toHaveBeenCalled();
    });
  });
});
/* eslint-enable @typescript-eslint/naming-convention */
