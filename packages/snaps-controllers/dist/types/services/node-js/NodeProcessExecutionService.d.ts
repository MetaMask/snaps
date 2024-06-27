/// <reference types="node" />
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import type { ChildProcess } from 'child_process';
import type { TerminateJobArgs } from '..';
import { AbstractExecutionService } from '..';
export declare class NodeProcessExecutionService extends AbstractExecutionService<ChildProcess> {
    protected initEnvStream(): Promise<{
        worker: ChildProcess;
        stream: BasePostMessageStream;
    }>;
    protected terminateJob(jobWrapper: TerminateJobArgs<ChildProcess>): void;
}
