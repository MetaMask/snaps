import { WebViewMessageStream } from '../services/webview/WebViewMessageStream';

/**
 * Parses the injected JS and returns the JSON payload.
 *
 * @param js - The injected JS.
 * @returns The decoded JSON as a string.
 */
export function parseInjectedJS(js: string) {
  return JSON.parse(js.slice(19, -1));
}

/**
 * Takes no param and return mocks necessary for testing WebViewMessageStream.
 *
 * @returns The mockWebView, and mockStream.
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

  const streamA = new WebViewMessageStream({
    name: 'a',
    target: 'b',
    webView: mockWebViewA,
  });

  const streamB = new WebViewMessageStream({
    name: 'b',
    target: 'a',
    webView: mockWebViewB,
  });

  return {
    mockWebViewA,
    mockWebViewB,
    streamA,
    streamB,
  };
}
