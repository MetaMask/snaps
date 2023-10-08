import type { ExecutionServiceArgs, Job } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';
declare type WebWorkerExecutionEnvironmentServiceArgs = {
    documentUrl: URL;
} & ExecutionServiceArgs;
export declare const WORKER_POOL_ID = "snaps-worker-pool";
export declare class WebWorkerExecutionService extends AbstractExecutionService<string> {
    #private;
    /**
     * Create a new webworker execution service.
     *
     * @param args - The constructor arguments.
     * @param args.documentUrl - The URL of the worker pool document to use as the
     * execution environment.
     * @param args.messenger - The messenger to use for communication with the
     * `SnapController`.
     * @param args.setupSnapProvider - The function to use to set up the snap
     * provider.
     */
    constructor({ documentUrl, messenger, setupSnapProvider, }: WebWorkerExecutionEnvironmentServiceArgs);
    /**
     * Send a termination command to the worker pool document.
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
     * Creates the worker pool document to be used as the execution environment.
     *
     * If the document already exists, this does nothing.
     */
    private createDocument;
}
export {};
