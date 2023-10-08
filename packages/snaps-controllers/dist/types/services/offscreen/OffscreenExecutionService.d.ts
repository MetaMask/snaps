import type { ExecutionServiceArgs, Job } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';
declare type OffscreenExecutionEnvironmentServiceArgs = {
    documentUrl: URL;
    frameUrl: URL;
} & ExecutionServiceArgs;
export declare class OffscreenExecutionService extends AbstractExecutionService<string> {
    #private;
    readonly documentUrl: URL;
    readonly frameUrl: URL;
    /**
     * Create a new offscreen execution service.
     *
     * @param args - The constructor arguments.
     * @param args.documentUrl - The URL of the offscreen document to use as the
     * execution environment. This must be a URL relative to the location where
     * this is called. This cannot be a public (http(s)) URL.
     * @param args.frameUrl - The URL of the iframe to load inside the offscreen
     * document.
     * @param args.messenger - The messenger to use for communication with the
     * `SnapController`.
     * @param args.setupSnapProvider - The function to use to set up the snap
     * provider.
     */
    constructor({ documentUrl, frameUrl, messenger, setupSnapProvider, }: OffscreenExecutionEnvironmentServiceArgs);
    /**
     * Send a termination command to the offscreen document.
     *
     * @param job - The job to terminate.
     */
    protected terminateJob(job: Job<string>): Promise<void>;
    /**
     * Create a new stream for the specified job. This wraps the runtime stream
     * in a stream specific to the job.
     *
     * @param jobId - The job ID.
     */
    protected initEnvStream(jobId: string): Promise<{
        worker: string;
        stream: ProxyPostMessageStream;
    }>;
    /**
     * Creates the offscreen document to be used as the execution environment.
     *
     * If the document already exists, this does nothing.
     */
    private createDocument;
}
export {};
