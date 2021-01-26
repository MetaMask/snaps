import { BasePostMessageStream, PostMessageEvent, StreamData } from './BasePostMessageStream';

interface WindowPostMessageStreamArgs {
  name: string;
  target: string;
  targetWindow: typeof window;
}

/**
 * Window.postMessage stream.
 */
export class WindowPostMessageStream extends BasePostMessageStream {

  private _name: string;

  private _target: string;

  private _targetWindow: typeof window;

  private _origin: string;

  constructor({
    name,
    target,
    targetWindow,
  }: Partial<WindowPostMessageStreamArgs> = {}) {
    if (!name || !target || !targetWindow) {
      throw new Error('Invalid input.');
    }

    super();

    this._name = name;
    this._target = target;
    this._targetWindow = targetWindow || window;
    this._origin = (targetWindow ? '*' : location.origin);
    this._onMessage = this._onMessage.bind(this);

    window.addEventListener('message', this._onMessage as any, false);

    this._handshake();
  }

  protected _postMessage(data: unknown): void {
    this._targetWindow.postMessage({
      target: this._target,
      data,
    }, this._origin);
  }

  private _onMessage(event: PostMessageEvent): void {
    const message = event.data;

    // validate message
    if (
      (this._origin !== '*' && event.origin !== this._origin) ||
      (event.source !== this._targetWindow) ||
      (typeof message !== 'object') ||
      (message.target !== this._name) ||
      (!message.data)
    ) {
      return;
    }

    this._onData(message.data as StreamData);
  }

  _destroy(): void {
    window.removeEventListener('message', this._onMessage as any, false);
  }
}
