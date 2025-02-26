import { sleep } from '@metamask/snaps-utils/test-utils';

import { createWebViewObjects } from '../../test-utils/webview';

describe('WebViewMessageStream', () => {
  it('can communicate between streams and be destroyed', async () => {
    const { streamA, streamB, mockWebViewA } = createWebViewObjects();
    await sleep(1);

    streamB.on('data', (value) => streamB.write(value * 5));

    // Get a deferred Promise for the result
    const responsePromise = new Promise((resolve) => {
      streamA.once('data', (number) => {
        resolve(Number(number));
      });
    });

    // Write to stream A, triggering a response from stream B
    streamA.write(111);

    expect(await responsePromise).toBe(555);

    expect(mockWebViewA.injectJavaScript).toHaveBeenCalledWith(
      `window.postMessage([123,34,116,97,114,103,101,116,34,58,34,98,34,44,34,100,97,116,97,34,58,34,83,89,78,34,125])`,
    );

    // Inject { target: "foo", data: 111 }
    mockWebViewA.injectJavaScript(
      `window.postMessage([123,34,116,97,114,103,101,116,34,58,34,102,111,111,34,44,34,100,97,116,97,34,58,49,49,49,125])`,
    );

    const listener = jest.fn();
    streamB.once('data', listener);

    await sleep(1);

    // Check that messages with the wrong target are skipped
    expect(listener).not.toHaveBeenCalled();

    const throwingListener = (data: any) => {
      throw new Error(`Unexpected data on stream: ${data}`);
    };

    streamA.once('data', throwingListener);
    streamB.once('data', throwingListener);

    // Destroy streams and confirm that they were destroyed
    streamA.destroy();
    streamB.destroy();
    expect(streamA.destroyed).toBe(true);
    expect(streamB.destroyed).toBe(true);
  });
});
