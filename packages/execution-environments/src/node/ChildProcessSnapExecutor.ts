import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { BaseSnapExecutor } from '../common/BaseSnapExecutor';
import { SNAP_STREAM_NAMES } from '../common/enums';
import { ChildProcessMessageStream } from './ChildProcessMessageStream';

export class ChildProcessSnapExecutor extends BaseSnapExecutor {
  static initalize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new ChildProcessMessageStream();
    const mux = new ObjectMultiplex();
    pump(parentStream, mux as any, parentStream, (err) => {
      if (err) {
        console.error(`Parent stream failure, closing worker.`, err);
      }
      self.close();
    });

    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC) as any;
    return new ChildProcessSnapExecutor(commandStream, rpcStream);
  }
}
