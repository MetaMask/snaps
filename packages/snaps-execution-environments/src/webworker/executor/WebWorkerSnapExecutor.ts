import ObjectMultiplex from '@metamask/object-multiplex';
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { WebWorkerPostMessageStream } from '@metamask/post-message-stream';
import { logError, SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import pump from 'pump';

import { BaseSnapExecutor } from '../../common/BaseSnapExecutor';
import { log } from '../../logging';

export class WebWorkerSnapExecutor extends BaseSnapExecutor {
  /**
   * Initialize the WebWorkerSnapExecutor. This creates a post message stream
   * from and to the parent window, for two-way communication with the iframe.
   *
   * @param stream - The stream to use for communication.
   * @returns An instance of `WebWorkerSnapExecutor`, with the initialized post
   * message streams.
   */
  static initialize(
    stream: BasePostMessageStream = new WebWorkerPostMessageStream(),
  ) {
    log('Worker: Connecting to parent.');

    const mux = new ObjectMultiplex();
    pump(stream, mux, stream, (error) => {
      if (error) {
        logError(`Parent stream failure, closing worker.`, error);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    return new WebWorkerSnapExecutor(commandStream, rpcStream);
  }
}
