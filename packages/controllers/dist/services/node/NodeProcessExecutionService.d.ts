/// <reference types="node" />
import { ChildProcess } from 'child_process';
import { BasePostMessageStream } from '@metamask/post-message-stream';
import { AbstractExecutionService, Job } from '..';
export declare class NodeProcessExecutionService extends AbstractExecutionService<ChildProcess> {
    protected _initEnvStream(): Promise<{
        worker: ChildProcess;
        stream: BasePostMessageStream;
    }>;
    protected _terminate(jobWrapper: Job<ChildProcess>): void;
}
