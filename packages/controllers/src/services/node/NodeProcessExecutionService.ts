import { ChildProcess, fork } from 'child_process';
import { BasePostMessageStream } from '@metamask/post-message-stream/dist/BasePostMessageStream';
import { ProcessParentMessageStream } from '@metamask/post-message-stream';
import { EnvMetadata, NodeExecutionService } from './NodeExecutionService';

export class NodeProcessExecutionService extends NodeExecutionService<ChildProcess> {
  protected _initEnvStream(): {
    worker: ChildProcess;
    stream: BasePostMessageStream;
  } {
    const worker = fork(
      require.resolve(
        '@metamask/execution-environments/dist/webpack/node-process/bundle.js',
      ),
    );
    const stream = new ProcessParentMessageStream({ process: worker });
    return { worker, stream };
  }

  protected _terminate(jobWrapper: EnvMetadata<ChildProcess>): void {
    jobWrapper.worker.kill();
  }
}
