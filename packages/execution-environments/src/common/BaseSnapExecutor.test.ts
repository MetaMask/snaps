import ObjectMultiplex from '@metamask/object-multiplex';
import { WorkerPostMessageStream } from '@metamask/post-message-stream';
import pump from 'pump';
import { BaseSnapExecutor } from './BaseSnapExecutor';
import { SNAP_STREAM_NAMES } from './enums';

class ExecutorMock extends BaseSnapExecutor {
  static initialize() {
    const parentStream = new WorkerPostMessageStream();
    const mux = new ObjectMultiplex();
    pump(parentStream, mux as any, parentStream, (err) => {
      if (err) {
        console.error('Parent stream failure, closing worker.', err);
      }
      self.close();
    });
    const commandStream = mux.createStream(SNAP_STREAM_NAMES.COMMAND);
    const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC) as any;
    return new ExecutorMock(commandStream, rpcStream);
  }
}

describe('BaseSnapExecutor', () => {
  it('should be able to create an executor', () => {
    const executor = ExecutorMock.initialize();
    expect(executor).toBeDefined();
  });
});
