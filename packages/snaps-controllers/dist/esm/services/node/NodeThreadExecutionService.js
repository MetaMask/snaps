import { ThreadParentMessageStream } from '@metamask/post-message-stream';
// eslint-disable-next-line @typescript-eslint/no-shadow
import { Worker } from 'worker_threads';
import { AbstractExecutionService } from '..';
export class NodeThreadExecutionService extends AbstractExecutionService {
    async initEnvStream() {
        const worker = new Worker(require.resolve('@metamask/snaps-execution-environments/dist/browserify/node-thread/bundle.js'));
        const stream = new ThreadParentMessageStream({
            thread: worker
        });
        return Promise.resolve({
            worker,
            stream
        });
    }
    async terminateJob(jobWrapper) {
        await jobWrapper.worker.terminate();
    }
}

//# sourceMappingURL=NodeThreadExecutionService.js.map