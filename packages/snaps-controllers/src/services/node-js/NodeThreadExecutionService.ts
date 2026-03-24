import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { ThreadParentMessageStream } from '@metamask/post-message-stream/node';
import { Worker } from 'worker_threads';

import { ExecutionService } from '../ExecutionService';
import type { TerminateJobArgs } from '../ExecutionService';

export class NodeThreadExecutionService extends ExecutionService<Worker> {
  protected async initEnvStream(snapId: string): Promise<{
    worker: Worker;
    stream: BasePostMessageStream;
  }> {
    this.setSnapStatus(snapId, 'initializing');

    const worker = new Worker(
      require.resolve('@metamask/snaps-execution-environments/node-thread'),
      {
        stdout: true,
        stderr: true,
      },
    );

    // Capturing `stdout` and `stderr` from the worker prevents the worker from
    // writing to them directly, making it easier to capture them Jest.
    worker.stdout.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.log(data.toString());
    });

    worker.stderr.on('data', (data) => {
      // eslint-disable-next-line no-console
      console.error(data.toString());
    });

    const stream = new ThreadParentMessageStream({ thread: worker });
    return Promise.resolve({ worker, stream });
  }

  protected async terminateJob(
    jobWrapper: TerminateJobArgs<Worker>,
  ): Promise<void> {
    await jobWrapper.worker?.terminate();
  }
}
