import { ChildProcess } from 'child_process';
import {
  BasePostMessageStream,
  StreamData,
} from '@metamask/post-message-stream/dist/BasePostMessageStream';

type ChildProcessParentMessageStreamArgs = {
  process: ChildProcess;
};

export class ChildProcessParentMessageStream extends BasePostMessageStream {
  private _process: ChildProcess;

  constructor({ process }: ChildProcessParentMessageStreamArgs) {
    super();

    this._process = process;
    this._onMessage = this._onMessage.bind(this);
    this._process.on('message', this._onMessage);

    this._handshake();
  }

  protected _postMessage(data: StreamData): void {
    this._process.send({ data });
  }

  private _onMessage(message: any): void {
    // validate message
    if (typeof message !== 'object' || !message.data) {
      return;
    }

    this._onData(message.data as StreamData);
  }

  _destroy(): void {
    this._process.removeListener('message', this._onMessage);
  }
}
