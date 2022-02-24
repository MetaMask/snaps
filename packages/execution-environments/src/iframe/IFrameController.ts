import ObjectMultiplex from '@metamask/object-multiplex';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
import pump from 'pump';
import { BaseController } from '../common/BaseControllers';
import { SNAP_STREAM_NAMES } from '../common/enums';

export class IFrameController extends BaseController {
  static initialize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new WindowPostMessageStream({
      name: 'child',
      target: 'parent',
      targetWindow: self.parent,
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

    return new IFrameController(commandStream, rpcStream);
  }
}
