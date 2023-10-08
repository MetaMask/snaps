/// <reference types="node" />
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { Worker } from 'worker_threads';
import type { Job } from '..';
import { AbstractExecutionService } from '..';
export declare class NodeThreadExecutionService extends AbstractExecutionService<Worker> {
    protected initEnvStream(): Promise<{
        worker: Worker;
        stream: BasePostMessageStream;
    }>;
    protected terminateJob(jobWrapper: Job<Worker>): Promise<void>;
}
