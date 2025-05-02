import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { ThreadParentMessageStream } from '@metamask/post-message-stream/node';
import { Worker } from 'worker_threads';

import type { TerminateJobArgs } from '..';
import { AbstractExecutionService } from '..';

export class NodeThreadExecutionService extends AbstractExecutionService<Worker> {
  protected async initEnvStream(): Promise<{
    worker: Worker;
    stream: BasePostMessageStream;
  }> {
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

  // TODO: Either fix this lint violation or explain why it's necessary to
  //  ignore.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  protected async terminateJob(
    jobWrapper: TerminateJobArgs<Worker>,
  ): Promise<void> {
    await jobWrapper.worker?.terminate();
  }
}
