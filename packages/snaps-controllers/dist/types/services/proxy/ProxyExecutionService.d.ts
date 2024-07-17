import type { BasePostMessageStream } from '@metamask/post-message-stream';
import type { ExecutionServiceArgs, TerminateJobArgs } from '../AbstractExecutionService';
import { AbstractExecutionService } from '../AbstractExecutionService';
import { ProxyPostMessageStream } from '../ProxyPostMessageStream';
declare type ProxyExecutionEnvironmentServiceArgs = {
    stream: BasePostMessageStream;
} & ExecutionServiceArgs;
export declare class ProxyExecutionService extends AbstractExecutionService<string> {
    #private;
    /**
     * Create a new proxy execution service.
     *
     * @param args - The constructor arguments.
     * @param args.messenger - The messenger to use for communication with the
     * `SnapController`.
     * @param args.setupSnapProvider - The function to use to set up the snap
     * provider.
     * @param args.stream - The stream to use for communicating with the proxy
     * executor.
     */
    constructor({ stream, messenger, setupSnapProvider, }: ProxyExecutionEnvironmentServiceArgs);
    /**
     * Send a termination command to the proxy stream.
     *
     * @param job - The job to terminate.
     */
    protected terminateJob(job: TerminateJobArgs<string>): Promise<void>;
    /**
     * Create a new stream for the specified job. This wraps the root stream
     * in a stream specific to the job.
     *
     * @param jobId - The job ID.
     */
    protected initEnvStream(jobId: string): Promise<{
        worker: string;
        stream: ProxyPostMessageStream;
    }>;
}
export {};
