import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { NativeSnapExecutor } from '@metamask/snaps-execution-environments';
import type { Json } from '@metamask/utils';
import { Duplex } from 'readable-stream';

import {
  AbstractExecutionService,
  type TerminateJobArgs,
} from '../AbstractExecutionService';

export class NativeExecutionService extends AbstractExecutionService<NativeSnapExecutor> {
  protected terminateJob(_job: TerminateJobArgs<NativeSnapExecutor>): void {
    // no-op
  }

  protected async initEnvStream(
    _snapId: string,
  ): Promise<{ worker: NativeSnapExecutor; stream: BasePostMessageStream }> {
    // TODO: Sanity check this.
    const workerStream = new Duplex({
      objectMode: true,
      read() {
        return undefined;
      },
      write(chunk: Json, encoding: BufferEncoding, callback) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        stream.push(chunk, encoding);
        callback();
      },
    });
    const stream = new Duplex({
      objectMode: true,
      read() {
        return undefined;
      },
      write(chunk: Json, encoding: BufferEncoding, callback) {
        workerStream.push(chunk, encoding);
        callback();
      },
    }) as unknown as BasePostMessageStream;

    // NOTE: Initializes a Snap executor that runs in the same JS thread as the execution service.
    // Does not provide process isolation.
    const worker = NativeSnapExecutor.initialize(workerStream);

    return Promise.resolve({ worker, stream });
  }
}
