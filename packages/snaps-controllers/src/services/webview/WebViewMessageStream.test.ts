import { sleep } from '@metamask/snaps-utils/test-utils';

import { createWebViewObjects } from '../../test-utils/webview';

describe('WebViewMessageStream', () => {
  it('initializes correctly', async () => {
    const { mockWebView, mockGetWebView } = createWebViewObjects();

    expect(mockGetWebView).toHaveBeenCalled();
    await sleep(1); // wait for getWebView promise to resolve
    expect(mockWebView.addEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });

  it('handles _postMessage(write) correctly', async () => {
    const { mockWebView, mockStream } = createWebViewObjects();

    const message = { foo: 'bar' };
    await sleep(1);

    mockStream.write(message);
    expect(mockWebView.injectJavaScript).toHaveBeenCalledWith(
      `window.postMessage('eyJ0YXJnZXQiOiJ0YXJnZXRTdHJlYW0iLCJkYXRhIjoiU1lOIn0=')`,
    );

    mockStream.destroy();
  });

  it('calls _onMessage when a message event is emitted', async () => {
    const { mockWebView, mockStream } = createWebViewObjects();

    const mockMessageEvent = {
      data: JSON.stringify({
        target: 'test',
        data: 'Test message',
      }),
    };
    await sleep(1);
    const onMessageSpy = jest.spyOn(mockStream, '_onMessage' as any);
    const listener = mockWebView.addEventListener.mock.calls[0][1];
    listener(mockMessageEvent);

    expect(onMessageSpy).toHaveBeenCalled();
  });

  it('ignores _onMessage with wrong target', async () => {
    const { mockStream } = createWebViewObjects();
    const messageEvent = {
      data: {
        target: 'wrongTarget',
        data: { foo: 'bar' },
      },
    };

    await sleep(1);
    mockStream.read(messageEvent as any);
    expect(mockStream.read()).toBeNull();
  });

  it('handles destroy correctly', async () => {
    const { mockWebView, mockStream } = createWebViewObjects();
    await sleep(1);
    mockStream.destroy();
    expect(mockWebView.removeEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });
});
