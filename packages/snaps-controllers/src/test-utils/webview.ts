import { bytesToString } from '@metamask/utils';

import { WebViewMessageStream } from '../services/webview/WebViewMessageStream';

/**
 * Parses the injected JS and returns the JSON payload.
 *
 * @param js - The injected JS.
 * @returns The decoded JSON as a string.
 */
export function parseInjectedJS(js: string) {
  const byteString = js.slice(19, -1);
  const bytes = new Uint8Array(JSON.parse(byteString));
  return bytesToString(bytes);
}

/**
 * Takes no param and return mocks necessary for testing WebViewMessageStream.
 *
 * @returns The mockWebView, mockGetWebView, and mockStream.
 */
export function createWebViewObjects() {
  const registerMessageListenerA = jest.fn();
  const registerMessageListenerB = jest.fn();

  const mockWebViewA = {
    registerMessageListener: registerMessageListenerA,
    unregisterMessageListener: jest.fn(),
    injectJavaScript: jest.fn().mockImplementation((js) => {
      const json = parseInjectedJS(js);
      registerMessageListenerB.mock.calls.forEach(([listener]) => {
        setTimeout(() => listener({ data: json }));
      });
    }),
  };

  const mockWebViewB = {
    registerMessageListener: registerMessageListenerB,
    unregisterMessageListener: jest.fn(),
    injectJavaScript: jest.fn().mockImplementation((js) => {
      const json = parseInjectedJS(js);
      registerMessageListenerA.mock.calls.forEach(([listener]) => {
        setTimeout(() => listener({ data: json }));
      });
    }),
  };

  const mockGetWebViewA = jest.fn().mockResolvedValue(mockWebViewA);
  const mockGetWebViewB = jest.fn().mockResolvedValue(mockWebViewB);

  const streamA = new WebViewMessageStream({
    name: 'a',
    target: 'b',
    getWebView: mockGetWebViewA,
  });

  const streamB = new WebViewMessageStream({
    name: 'b',
    target: 'a',
    getWebView: mockGetWebViewB,
  });

  return {
    mockWebViewA,
    mockWebViewB,
    mockGetWebViewA,
    mockGetWebViewB,
    streamA,
    streamB,
  };
}
