import {
  BasePostMessageStream,
  PostMessageEvent,
  StreamData,
} from '@metamask/post-message-stream/dist/BasePostMessageStream';

type MobilePostMessageStreamArgs = {
  name: string;
  target: string;
  targetWindow?: Window;
  targetOrigin?: string;
};

/**
 * Window.postMessage stream.
 */
export class MobilePostMessageStream extends BasePostMessageStream {
  private _name: string;

  private _target: string;

  private _targetOrigin: string;

  private _targetWindow: Window;

  /**
   * Creates a stream for communicating with other streams across the same or
   * different window objects.
   *
   * @param args.name - The name of the stream. Used to differentiate between
   * multiple streams sharing the same window object.
   * @param args.target - The name of the stream to exchange messages with.
   * @param args.targetWindow - The window object of the target stream. Defaults
   * to `window`.
   * @param args.targetOrigin - The target origin for the iframe. Defaults to location.origin, allows '*' to be passed.
   */
  constructor({
    name,
    target,
    targetWindow = window,
    targetOrigin = location.origin,
  }: MobilePostMessageStreamArgs) {
    if (!name || !target) {
      throw new Error('Invalid input.');
    }
    super();

    this._name = name;
    this._target = target;
    this._targetOrigin = targetOrigin;
    this._targetWindow = targetWindow;
    this._onMessage = this._onMessage.bind(this);

    this._handshake();
  }

  protected _postMessage(data: unknown): void {
    this._targetWindow.postMessage(
      {
        target: this._target,
        data,
      },
      this._targetOrigin,
    );
  }

  private _onMessage(event: PostMessageEvent): void {
    const message = event.data;

    // validate message
    if (
      (this._targetOrigin !== '*' && event.origin !== this._targetOrigin) ||
      event.source !== this._targetWindow ||
      typeof message !== 'object' ||
      message.target !== this._name ||
      !message.data
    ) {
      return;
    }

    this._onData(message.data as StreamData);
  }

  _destroy(): void {
    //
  }
}
