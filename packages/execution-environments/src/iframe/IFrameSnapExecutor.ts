import ObjectMultiplex from '@metamask/object-multiplex';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import pump from 'pump';
import { SNAP_STREAM_NAMES } from '@metamask/snap-utils';
import { BaseSnapExecutor } from '../common/BaseSnapExecutor';

export class IFrameSnapExecutor extends BaseSnapExecutor {
  /**
   * Initialize the IFrameSnapExecutor. This creates a post message stream from
   * and to the parent window, for two-way communication with the iframe.
   *
   * @returns An instance of `IFrameSnapExecutor`, with the initialized post
   * message streams.
   */
  static initialize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new WindowPostMessageStream({
      name: 'child',
      target: 'parent',
      targetWindow: self.parent,
      targetOrigin: '*',
    });

    const mux = new ObjectMultiplex();
    pump(parentStream, mux, parentStream, (err) => {
      if (err) {
        console.error(`Parent stream failure, closing worker.`, err);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    return new IFrameSnapExecutor(commandStream, rpcStream);
  }
}
