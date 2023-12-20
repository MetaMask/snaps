/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { ProxyMessageStream } from './ProxyMessageStream';

describe('ProxyMessageStream', () => {
  let originalPostMessage: any;

  beforeEach(() => {
    originalPostMessage = window.postMessage;

    Object.assign(global, {
      window: {
        ReactNativeWebView: {
          postMessage: jest.fn(),
        },
      },
    });
  });

  afterEach(() => {
    window.postMessage = originalPostMessage;
  });

  it('throws if window.postMessage is not a function', () => {
    (window as any).postMessage = undefined;
    expect(
      () => new ProxyMessageStream({ name: 'foo', target: 'bar' }),
    ).toThrow(
      'window.postMessage is not a function. This class should only be instantiated in a Window.',
    );
  });

  it('destroy streams and confirm that they were destroyed', () => {
    const stream = new ProxyMessageStream({
      name: 'foo',
      target: 'target',
      targetOrigin: '*',
    });
    stream.destroy();
    expect(stream.destroyed).toBe(true);
  });

  it('send and receive messages', () => {
    const mockAddEventListener = jest.fn();
    window.addEventListener = mockAddEventListener;

    const stream = new ProxyMessageStream({
      name: 'webview',
      target: 'rnside',
      targetOrigin: '*',
      targetWindow: window.ReactNativeWebView,
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

  it('calls _onMessage when a message event is fired', () => {
    const stream = new ProxyMessageStream({
      name: 'webview',
      target: 'rnside',
      targetOrigin: '*',
      targetWindow: window.ReactNativeWebView,
    });

    const spy = jest.spyOn(stream as any, '_onMessage');

    const messageEvent = new MessageEvent('message', { data: 'test' });
    window.dispatchEvent(messageEvent);

    setTimeout(() => {
      expect(spy).toHaveBeenCalledWith(messageEvent);
    }, 0);
  });

  it('calls window.removeEventListener when _destroy is called', () => {
    const stream = new ProxyMessageStream({
      name: 'webview',
      target: 'rnside',
      targetOrigin: '*',
      targetWindow: window.ReactNativeWebView,
    });

    const spy = jest
      .spyOn(window, 'removeEventListener')
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .mockImplementation(() => {});

    (stream as any)._destroy();

    expect(spy).toHaveBeenCalledWith('message', expect.any(Function), false);

    spy.mockRestore();
  });
});
