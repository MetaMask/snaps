import type { BasePostMessageStream } from '@metamask/post-message-stream';
import type { Job, ExecutionServiceArgs } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
declare type IframeExecutionEnvironmentServiceArgs = {
    iframeUrl: URL;
} & ExecutionServiceArgs;
export declare class IframeExecutionService extends AbstractExecutionService<Window> {
    iframeUrl: URL;
    constructor({ iframeUrl, messenger, setupSnapProvider, }: IframeExecutionEnvironmentServiceArgs);
    protected terminateJob(jobWrapper: Job<Window>): void;
    protected initEnvStream(jobId: string): Promise<{
        worker: Window;
        stream: BasePostMessageStream;
    }>;
}
export {};
