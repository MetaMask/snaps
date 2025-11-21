import ObjectMultiplex from '@metamask/object-multiplex';
import { logError, SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import type { Duplex } from 'readable-stream';
import { pipeline } from 'readable-stream';

import { BaseSnapExecutor } from '../common/BaseSnapExecutor';

export class NativeSnapExecutor extends BaseSnapExecutor {
  static initialize(stream: Duplex) {
    const mux = new ObjectMultiplex();
    pipeline(stream, mux, stream, (error) => {
      if (error) {
        logError(`Parent stream failure, closing worker.`, error);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

    return new NativeSnapExecutor(commandStream, rpcStream);
  }
}
