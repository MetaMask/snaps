import ObjectMultiplex from '@metamask/object-multiplex';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { logError, SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import pump from 'pump';

import { BaseSnapExecutor } from '../common/BaseSnapExecutor';
import { log } from '../logging';

export class IFrameSnapExecutor extends BaseSnapExecutor {
  /**
   * Initialize the IFrameSnapExecutor. This creates a post message stream from
   * and to the parent window, for two-way communication with the iframe.
   *
   * @returns An instance of `IFrameSnapExecutor`, with the initialized post
   * message streams.
   */
  static initialize() {
    log('Worker: Connecting to parent.');

    const parentStream = new WindowPostMessageStream({
      name: 'child',
      target: 'parent',
      targetWindow: self.parent,
      targetOrigin: '*',
    });

    const mux = new ObjectMultiplex();
    pump(parentStream, mux, parentStream, (error) => {
      if (error) {
        logError(`Parent stream failure, closing worker.`, error);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    return new IFrameSnapExecutor(commandStream, rpcStream);
  }
}
