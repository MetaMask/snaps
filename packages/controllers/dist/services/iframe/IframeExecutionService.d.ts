import { BasePostMessageStream } from '@metamask/post-message-stream';
import { Job, AbstractExecutionService, ExecutionServiceArgs } from '../AbstractExecutionService';
declare type IframeExecutionEnvironmentServiceArgs = {
    iframeUrl: URL;
} & ExecutionServiceArgs;
export declare class IframeExecutionService extends AbstractExecutionService<Window> {
    iframeUrl: URL;
    constructor({ iframeUrl, messenger, setupSnapProvider, }: IframeExecutionEnvironmentServiceArgs);
    protected _terminate(jobWrapper: Job<Window>): void;
    protected _initEnvStream(jobId: string): Promise<{
        worker: Window;
        stream: BasePostMessageStream;
    }>;
    /**
     * Creates the iframe to be used as the execution environment. This may run
     * forever if the iframe never loads, but the promise should be wrapped in
     * an initialization timeout in the SnapController.
     *
     * @param uri - The iframe URI.
     * @param jobId - The job id.
     * @returns A promise that resolves to the contentWindow of the iframe.
     */
    private _createWindow;
}
export {};
