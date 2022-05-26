import { Duplex } from 'stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import pump from 'pump';
import { BaseSnapExecutor } from '../common/BaseSnapExecutor';
import { SNAP_STREAM_NAMES } from '../common/enums';
import { MobilePostMessageStream } from './MobilePostMessageStream';

export class MobileSnapExecutor extends BaseSnapExecutor {
  public rootStream?: Duplex;
  public rpcStreamRef?: Duplex;

  public commandStreamRef?: Duplex;

  postMessageCommandStream(message: any) {
    this.commandStreamRef?.write(message);
  }

  postMessageRpcStream(message: any) {
    this.rpcStreamRef?.write(message);
  }

  static initialize() {
    console.log('Worker: Connecting to parent.');

    const parentStream = new MobilePostMessageStream({
      name: 'child',
      target: 'parent',
      targetWindow: (window as any).ReactNativeWebView,
    });

    const mux = new ObjectMultiplex();
    pump(parentStream, mux, parentStream, (err) => {
      if (err) {
        console.error(`Parent stream failure, closing worker.`, err);
      }
      self.close();
    });


    const commandStreamRef = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStreamRef = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);
    const executor = new MobileSnapExecutor(commandStreamRef, rpcStreamRef);
    executor.rootStream = mux;
    executor.rpcStreamRef = rpcStreamRef;
    executor.commandStreamRef = commandStreamRef;

    return executor;
  }
}
