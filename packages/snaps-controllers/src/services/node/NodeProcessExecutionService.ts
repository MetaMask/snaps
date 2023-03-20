import {
  ProcessParentMessageStream,
  BasePostMessageStream,
} from '@metamask/post-message-stream';
import { ChildProcess, fork } from 'child_process';

import { AbstractExecutionService, Job } from '..';

export class NodeProcessExecutionService extends AbstractExecutionService<ChildProcess> {
  protected async initEnvStream(): Promise<{
    worker: ChildProcess;
    stream: BasePostMessageStream;
  }> {
    const worker = fork(
      require.resolve(
        '@metamask/snaps-execution-environments/dist/browserify/node-process/bundle.js',
      ),
    );

    const stream = new ProcessParentMessageStream({ process: worker });
    return Promise.resolve({ worker, stream });
  }

  protected terminateJob(jobWrapper: Job<ChildProcess>): void {
    jobWrapper.worker.kill();
  }
}
