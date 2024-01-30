import { sleep } from '@metamask/snaps-utils/test-utils';
import { bytesToBase64, stringToBytes } from '@metamask/utils';

import { WebViewExecutorStream } from './WebViewExecutorStream';

describe('WebViewExecutorStream', () => {
  beforeEach(() => {
    const addEventListener = jest.fn();
    const postMessage = jest.fn().mockImplementation((message) => {
      const bytes = stringToBytes(message);
      const base64 = bytesToBase64(bytes);
      addEventListener.mock.calls.forEach(([_type, listener]) => {
        setTimeout(() => listener({ data: base64 }));
      });
    });
    const mockWindow = {
      postMessage,
      addEventListener,
      removeEventListener: jest.fn(),
    };

    global.window = mockWindow as any;
  });

  it('throws if window.postMessage is not a function', () => {
    expect(
      () =>
        new WebViewExecutorStream({
          name: 'child', // webview
          target: 'parent', // rnside
          targetWindow: {} as any,
        }),
    ).toThrow('this[#targetWindow].postMessage is not a function');
  });

  it('can communicate between streams and be destroyed', async () => {
    const streamA = new WebViewExecutorStream({
      name: 'a',
      target: 'b',
      targetWindow: window,
    });
    const streamB = new WebViewExecutorStream({
      name: 'b',
      target: 'a',
      targetWindow: window,
    });

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

    // Post { target: "foo", data: 111 }
    window.postMessage(JSON.stringify({ target: 'foo', data: 111 }));

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
