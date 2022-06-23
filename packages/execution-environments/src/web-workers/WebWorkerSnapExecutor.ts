import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerPostMessageStream } from '@metamask/post-message-stream';
import pump from 'pump';
import { BaseSnapExecutor } from '../common/BaseSnapExecutor';
import { SNAP_STREAM_NAMES } from '../common/enums';

export class WebWorkerSnapExecutor extends BaseSnapExecutor {
  /**
   * Initialize the WebWorkerSnapExecutor. This creates a post message stream
   * from and to the parent, for two-way communication with the web worker.
   *
   * @returns An instance of `WebWorkerSnapExecutor`, with the initialized post
   * message streams.
   */
  static initialize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new WorkerPostMessageStream();
    const mux = new ObjectMultiplex();
    pump(parentStream, mux as any, parentStream, (err) => {
      if (err) {
        console.error(`Parent stream failure, closing worker.`, err);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC) as any;
    return new WebWorkerSnapExecutor(commandStream, rpcStream);
  }
}
