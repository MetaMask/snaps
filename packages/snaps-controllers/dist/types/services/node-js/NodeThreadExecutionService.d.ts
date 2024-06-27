/// <reference types="node" />
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { Worker } from 'worker_threads';
import type { TerminateJobArgs } from '..';
import { AbstractExecutionService } from '..';
export declare class NodeThreadExecutionService extends AbstractExecutionService<Worker> {
    protected initEnvStream(): Promise<{
        worker: Worker;
        stream: BasePostMessageStream;
    }>;
    protected terminateJob(jobWrapper: TerminateJobArgs<Worker>): Promise<void>;
}
