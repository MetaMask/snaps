import ObjectMultiplex from '@metamask/object-multiplex';
import { ThreadMessageStream } from '@metamask/post-message-stream';
import { logError, SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import pump from 'pump';

import { BaseSnapExecutor } from '../common/BaseSnapExecutor';
import { log } from '../logging';

export class ThreadSnapExecutor extends BaseSnapExecutor {
  static initialize() {
    log('Worker: Connecting to parent.');

    const parentStream = new ThreadMessageStream();
    const mux = new ObjectMultiplex();
    pump(parentStream, mux as any, parentStream, (error) => {
      if (error) {
        logError(`Parent stream failure, closing worker.`, error);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC) as any;
    return new ThreadSnapExecutor(commandStream, rpcStream);
  }
}
