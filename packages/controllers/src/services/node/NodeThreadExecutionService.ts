import { Worker } from 'worker_threads';
import { BasePostMessageStream } from '@metamask/post-message-stream/dist/BasePostMessageStream';
import { ThreadParentMessageStream } from '@metamask/post-message-stream';
import { EnvMetadata, NodeExecutionService } from './NodeExecutionService';

export class NodeThreadExecutionService extends NodeExecutionService<Worker> {
  protected _initEnvStream(): {
    worker: Worker;
    stream: BasePostMessageStream;
  } {
    const worker = new Worker(
      require.resolve(
        '@metamask/execution-environments/dist/webpack/node-thread/bundle.js',
      ),
    );
    const stream = new ThreadParentMessageStream({ thread: worker });
    return { worker, stream };
  }

  protected _terminate(jobWrapper: EnvMetadata<Worker>): void {
    jobWrapper.worker.terminate();
  }
}
