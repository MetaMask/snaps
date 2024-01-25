import { sleep } from '@metamask/snaps-utils/test-utils';

import { createWebViewObjects } from '../../test-utils/webview';
import type { WebViewMessageStream } from './WebViewMessageStream';

describe('WebViewMessageStream', () => {
  let mockWebView: any;
  let getWebView: any;
  let stream: WebViewMessageStream;

  it('initializes correctly', async () => {
    const testObjects = createWebViewObjects();
    mockWebView = testObjects.mockWebView;
    getWebView = testObjects.mockGetWebView;

    // Initialize stream. Different from other post-message streams, we have to wait for the WebView to fully load before we can continue using the stream.
    stream = testObjects.mockStream;

    expect(getWebView).toHaveBeenCalled();
    await sleep(1); // wait for getWebView promise to resolve
    expect(mockWebView.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });

  it('handles _postMessage(write) correctly', () => {
    const message = { foo: 'bar' };
    stream.write(message);

    expect(mockWebView.injectJavaScript).toHaveBeenCalledWith(
      `window.postMessage('eyJ0YXJnZXQiOiJ0YXJnZXRTdHJlYW0iLCJkYXRhIjoiU1lOIn0=')`,
    );

    stream.destroy();
  });

  it('calls _onMessage when a message event is emitted', () => {
    const mockMessageEvent = {
      data: JSON.stringify({
        target: 'test',
        data: 'Test message',
      }),
    };

    const onMessageSpy = jest.spyOn(stream, '_onMessage' as any);
    const listener = mockWebView.addEventListener.mock.calls[0][1];
    listener(mockMessageEvent);

    expect(onMessageSpy).toHaveBeenCalled();
  });

  it('ignores _onMessage with wrong target', () => {
    const messageEvent = {
      data: {
        target: 'wrongTarget',
        data: { foo: 'bar' },
      },
    };
    stream.read(messageEvent as any);
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
