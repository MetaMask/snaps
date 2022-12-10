/// <reference types="node" />
import { Worker } from 'worker_threads';
import { BasePostMessageStream } from '@metamask/post-message-stream';
import { AbstractExecutionService, Job } from '..';
export declare class NodeThreadExecutionService extends AbstractExecutionService<Worker> {
    protected _initEnvStream(): Promise<{
        worker: Worker;
        stream: BasePostMessageStream;
    }>;
    protected _terminate(jobWrapper: Job<Worker>): void;
}
