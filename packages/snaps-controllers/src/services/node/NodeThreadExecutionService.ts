import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { ThreadParentMessageStream } from '@metamask/post-message-stream';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { Worker } from 'worker_threads';

import type { Job } from '..';
import { AbstractExecutionService } from '..';

export class NodeThreadExecutionService extends AbstractExecutionService<Worker> {
  protected async initEnvStream(): Promise<{
    worker: Worker;
    stream: BasePostMessageStream;
  }> {
    const worker = new Worker(
      require.resolve(
        '@metamask/snaps-execution-environments/dist/browserify/node-thread/bundle.js',
      ),
    );
    const stream = new ThreadParentMessageStream({ thread: worker });
    return Promise.resolve({ worker, stream });
  }

  protected async terminateJob(jobWrapper: Job<Worker>): Promise<void> {
    await jobWrapper.worker.terminate();
  }
}
