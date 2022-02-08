import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerPostMessageStream } from '@metamask/post-message-stream';
import pump from 'pump';
import { BaseController } from '../common/BaseControllers';
import { SNAP_STREAM_NAMES } from '../common/enums';

export class WebWorkerController extends BaseController {
  static initalize() {
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
    return new WebWorkerController(commandStream, rpcStream);
  }
}
