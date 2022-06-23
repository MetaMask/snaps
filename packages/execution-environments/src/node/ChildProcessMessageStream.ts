import {
  BasePostMessageStream,
  StreamData,
} from '@metamask/post-message-stream/dist/BasePostMessageStream';

export class ChildProcessMessageStream extends BasePostMessageStream {
  constructor() {
    super();

    this._onMessage = this._onMessage.bind(this);
    globalThis.process.on('message', this._onMessage);

    this._handshake();
  }

  protected _postMessage(data: StreamData): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    globalThis.process.send!({ data });
  }

  private _onMessage(message: any): void {
    // validate message
    if (typeof message !== 'object' || !message.data) {
      return;
    }

    this._onData(message.data as StreamData);
  }

  _destroy(): void {
    globalThis.process.removeListener('message', this._onMessage);
  }
}
