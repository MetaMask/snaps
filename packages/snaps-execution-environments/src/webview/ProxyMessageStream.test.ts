import { sleep } from '@metamask/snaps-utils/test-utils';

import { ProxyMessageStream } from './ProxyMessageStream';

describe('ProxyMessageStream', () => {
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      ReactNativeWebView: {
        postMessage: jest.fn() || undefined,
      },
      postMessage: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
      location: {
        origin: 'http://localhost',
      },
    };

    global.window = mockWindow;
  });

  it('throws if window.ReactNativeWebView.postMessage is not a function', () => {
    mockWindow.ReactNativeWebView.postMessage = undefined;
    expect(
      () => new ProxyMessageStream({ name: 'foo', target: 'bar' }),
    ).toThrow(
      'this[#targetWindow].ReactNativeWebView.postMessage is not a function',
    );
  });

  it('destroy streams and confirm that they were destroyed', async () => {
    const stream = new ProxyMessageStream({
      name: 'webview',
      target: 'rnside',
      targetOrigin: '*',
      targetWindow: mockWindow,
    });
    await sleep(1);
    stream.destroy();
    expect(stream.destroyed).toBe(true);
  });

  it('send and receive messages', () => {
    const mockAddEventListener = jest.fn();
    mockWindow.addEventListener = mockAddEventListener;

    const stream = new ProxyMessageStream({
      name: 'webview',
      target: 'rnside',
      targetOrigin: '*',
      targetWindow: mockWindow,
    });

    const mockCallback = jest.fn((data) => {
      expect(data).toBe('hello');
    });

    stream.on('data', mockCallback);
    stream.write('hello');

    expect(stream).not.toBeNull();
    expect(mockAddEventListener).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
      false,
    );
  });

  it('calls window.removeEventListener when _destroy is called', () => {
    const stream = new ProxyMessageStream({
      name: 'webview',
      target: 'rnside',
      targetOrigin: '*',
      targetWindow: mockWindow,
    });

    const spy = jest
      .spyOn(mockWindow, 'removeEventListener')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});

    stream.destroy();

    expect(spy).toHaveBeenCalledWith('message', expect.any(Function), false);

    spy.mockRestore();
  });
});
