import {
  DEFAULT_SNAP_BUNDLE,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import type { Json, JsonRpcRequest } from '@metamask/utils';
import { isJsonRpcRequest, isPlainObject } from '@metamask/utils';

import { createService } from '../../test-utils';
import { parseInjectedJS } from '../../test-utils/webview';
import { WebViewExecutionService } from './WebViewExecutionService';
import type { WebViewInterface } from './WebViewMessageStream';

/**
 * Create a response message for the given request. This function assumes that
 * the response is for the parent, and uses the command stream.
 *
 * @param request - The request to respond to.
 * @param response - The response to send.
 * @returns The response message.
 */
function getResponse(request: JsonRpcRequest, response: Json) {
  return {
    target: 'parent',
    data: {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: request.id,
        result: response,
      },
    },
  };
}

describe('WebViewExecutionService', () => {
  it('can boot', async () => {
    const mockedWebView = {
      unregisterMessageListener: jest.fn(),
      registerMessageListener: jest.fn(),
      injectJavaScript: jest.fn(),
    };

    const { service } = createService(WebViewExecutionService, {
      createWebView: async (_id: string) =>
        mockedWebView as unknown as WebViewInterface,
      removeWebView: () => {
        // no-op
      },
    });

    expect(service).toBeDefined();
    await service.terminateAllSnaps();
  });

  it('can execute snaps', async () => {
    const registerMessageListener = jest.fn();
    const sendMessage = jest.fn().mockImplementation((message) => {
      // Propagate message to all listeners.
      registerMessageListener.mock.calls.forEach(([listener]) => {
        setTimeout(() => listener({ data: JSON.stringify(message) }));
      });
    });

    const injectJavaScript = jest.fn().mockImplementation((js) => {
      const parsed = parseInjectedJS(js);
      sendMessage(JSON.parse(parsed));
    });

    // Since we can't easily run the webview execution service in a real
    // environment, we mock the responses that are expected from the service.
    // This mirrors the mock from the OffscreenExecutionService
    registerMessageListener((message: { data: string }) => {
      const { target, data } = JSON.parse(message.data);

      if (target !== 'child') {
        return;
      }

      // Respond with a handshake acknowledgement.
      if (data === 'SYN') {
        sendMessage({ target: 'parent', data: 'ACK' });
      }

      // Handle incoming requests.
      if (
        isPlainObject(data) &&
        data.name === 'command' &&
        isJsonRpcRequest(data.data)
      ) {
        const request = data.data;

        // Respond "OK" to the `ping`, `executeSnap`, and `terminate` request.
        if (
          request.method === 'ping' ||
          request.method === 'executeSnap' ||
          request.method === 'terminate'
        ) {
          sendMessage(getResponse(request, 'OK'));
        }
      }
    });

    const { service } = createService(WebViewExecutionService, {
      createWebView: async (_id: string) => ({
        registerMessageListener,
        unregisterMessageListener: jest.fn(),
        injectJavaScript,
      }),
      removeWebView: () => {
        // no-op
      },
    });

    expect(
      await service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        endowments: [],
      }),
    ).toBe('OK');

    await service.terminateAllSnaps();
  });
});
