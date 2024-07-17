import type { ExecutionServiceArgs } from '../AbstractExecutionService';
import { ProxyExecutionService } from '../proxy/ProxyExecutionService';
import type { WebViewInterface } from './WebViewMessageStream';
export declare type WebViewExecutionServiceArgs = ExecutionServiceArgs & {
    getWebView: () => Promise<WebViewInterface>;
};
export declare class WebViewExecutionService extends ProxyExecutionService {
    #private;
    constructor({ messenger, setupSnapProvider, getWebView, }: WebViewExecutionServiceArgs);
    /**
     * Create a new stream for the specified job. This wraps the runtime stream
     * in a stream specific to the job.
     *
     * @param jobId - The job ID.
     */
    protected initEnvStream(jobId: string): Promise<{
        worker: string;
        stream: import("..").ProxyPostMessageStream;
    }>;
}
