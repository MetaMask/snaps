import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { ThreadMessageStream } from '@metamask/post-message-stream';
import { SNAP_STREAM_NAMES } from '@metamask/snap-utils';
import { BaseSnapExecutor } from '../common/BaseSnapExecutor';

export class ThreadSnapExecutor extends BaseSnapExecutor {
  static initialize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new ThreadMessageStream();
    const mux = new ObjectMultiplex();
    pump(parentStream, mux as any, parentStream, (err) => {
      if (err) {
        console.error(`Parent stream failure, closing worker.`, err);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC) as any;
    return new ThreadSnapExecutor(commandStream, rpcStream);
  }
}
