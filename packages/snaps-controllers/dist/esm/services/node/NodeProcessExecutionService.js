import { ProcessParentMessageStream } from '@metamask/post-message-stream';
import { fork } from 'child_process';
import { AbstractExecutionService } from '..';
export class NodeProcessExecutionService extends AbstractExecutionService {
    async initEnvStream() {
        const worker = fork(require.resolve('@metamask/snaps-execution-environments/dist/browserify/node-process/bundle.js'));
        const stream = new ProcessParentMessageStream({
            process: worker
        });
        return Promise.resolve({
            worker,
            stream
        });
    }
    terminateJob(jobWrapper) {
        jobWrapper.worker.kill();
    }
}

//# sourceMappingURL=NodeProcessExecutionService.js.map