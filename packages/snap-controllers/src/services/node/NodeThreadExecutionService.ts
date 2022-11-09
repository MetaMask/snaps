import { Worker } from 'worker_threads';
import {
  ThreadParentMessageStream,
  BasePostMessageStream,
} from '@metamask/post-message-stream';
import { AbstractExecutionService, Job } from '..';

export class NodeThreadExecutionService extends AbstractExecutionService<Worker> {
  protected async _initEnvStream(): Promise<{
    worker: Worker;
    stream: BasePostMessageStream;
  }> {
    const worker = new Worker(
      require.resolve(
        '@metamask/execution-environments/dist/webpack/node-thread/bundle.js',
      ),
    );
    const stream = new ThreadParentMessageStream({ thread: worker });
    return { worker, stream };
  }

  protected _terminate(jobWrapper: Job<Worker>): void {
    jobWrapper.worker.terminate();
  }
}
