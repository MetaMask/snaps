import { sleep } from '@metamask/snaps-utils/test-utils';

import { createWebViewObjects } from '../../test-utils/webview';

describe('WebViewMessageStream', () => {
  it('initializes correctly', async () => {
    const { mockWebView, mockGetWebView } = createWebViewObjects();

    expect(mockGetWebView).toHaveBeenCalled();
    await sleep(1); // wait for getWebView promise to resolve
    expect(mockWebView.registerMessageListener).toHaveBeenCalled();
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
    const { mockStream, mockWebView } = createWebViewObjects();

    const mockCallback = jest.fn();
    mockWebView.registerMessageListener(mockCallback);
    sleep(1);
    mockStream.write('test message');
    const message = mockStream.read();
    mockStream.on('message', message);

    expect(mockWebView).toHaveBeenCalled();
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
    expect(mockWebView.unregisterMessageListener).toHaveBeenCalled();
  });
});
