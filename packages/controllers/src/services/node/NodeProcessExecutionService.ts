import { ChildProcess, fork } from 'child_process';
import {
  ProcessParentMessageStream,
  BasePostMessageStream,
} from '@metamask/post-message-stream';
import { AbstractExecutionService, Job } from '..';

export class NodeProcessExecutionService extends AbstractExecutionService<ChildProcess> {
  protected async _initEnvStream(): Promise<{
    worker: ChildProcess;
    stream: BasePostMessageStream;
  }> {
    const worker = fork(
      require.resolve(
        '@metamask/execution-environments/dist/webpack/node-process/bundle.js',
      ),
    );
    const stream = new ProcessParentMessageStream({ process: worker });
    return { worker, stream };
  }

  protected _terminate(jobWrapper: Job<ChildProcess>): void {
    jobWrapper.worker.kill();
  }
}
