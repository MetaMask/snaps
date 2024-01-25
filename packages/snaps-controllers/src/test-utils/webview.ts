import { WebViewMessageStream } from '../services/webview/WebViewMessageStream';

/**
 * Takes no param and return mocks necessary for testing WebViewMessageStream.
 *
 * @returns The mockWebView, mockGetWebView, and mockStream.
 */
export function createWebViewObjects() {
  const mockWebView = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    injectJavaScript: jest.fn(),
  };

  const mockGetWebView = jest.fn().mockResolvedValue(mockWebView);

  const mockStream = new WebViewMessageStream({
    name: 'testStream',
    target: 'targetStream',
    getWebView: mockGetWebView,
  });

  return { mockWebView, mockGetWebView, mockStream };
}
