import { sleep } from '@metamask/snaps-utils/test-utils';

import { WebViewMessageStream } from './WebViewMessageStream';

describe('WebViewMessageStream', () => {
  let mockWebView: any;
  let getWebView: any;
  let stream: WebViewMessageStream;

  beforeEach(() => {
    mockWebView = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      injectJavaScript: jest.fn(),
    };
    getWebView = jest.fn().mockResolvedValue(mockWebView);
    stream = new WebViewMessageStream({
      name: 'testStream',
      target: 'targetStream',
      getWebView,
    });
  });

  it('initializes correctly', async () => {
    expect(getWebView).toHaveBeenCalled();
    await sleep(1); // wait for getWebView promise to resolve
    expect(mockWebView.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });

  it('handles _postMessage correctly', () => {
    stream._postMessage({ foo: 'bar' });
    expect(mockWebView.injectJavaScript).toHaveBeenCalledWith(
      // We expect XSS encode approach to be used here encoding foo: 'bar' to value below
      `window.postMessage('eyJ0YXJnZXQiOiJ0YXJnZXRTdHJlYW0iLCJkYXRhIjoiU1lOIn0=')`,
    );
  });

  it('handles _onMessage correctly', () => {
    const mockedOnData = jest.fn();
    stream._onData = mockedOnData;

    const messageEvent = {
      data: JSON.stringify({
        target: 'testStream',
        data: { foo: 'bar' },
      }),
    };
    stream._onMessage(messageEvent);
    expect(mockedOnData).toHaveBeenCalledWith({ foo: 'bar' });
  });

  it('ignores _onMessage with wrong target', () => {
    const messageEvent = {
      data: JSON.stringify({
        target: 'wrongTarget',
        data: { foo: 'bar' },
      }),
    };
    stream._onMessage(messageEvent);
    expect(stream.read()).toBeNull();
  });

  it('handles destroy correctly', () => {
    stream.destroy();
    expect(mockWebView.removeEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });
});
