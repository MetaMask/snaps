import ObjectMultiplex from '@metamask/object-multiplex';
import { RuntimePostMessageStream } from '@metamask/post-message-stream';
import { SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import pump from 'pump';

import { BaseSnapExecutor } from '../common/BaseSnapExecutor';

export class OffscreenSnapExecutor extends BaseSnapExecutor {
  /**
   * Initialize the OffscreenSnapExecutor. This creates a post message stream
   * from and to the parent window, for two-way communication with the iframe.
   *
   * @returns An instance of `OffscreenSnapExecutor`, with the initialized post
   * message streams.
   */
  static initialize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new RuntimePostMessageStream({
      name: 'child',
      target: 'parent',
    });

    const mux = new ObjectMultiplex();
    pump(parentStream, mux, parentStream, (error) => {
      if (error) {
        console.error(`Parent stream failure, closing worker.`, error);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    return new OffscreenSnapExecutor(commandStream, rpcStream);
  }
}
