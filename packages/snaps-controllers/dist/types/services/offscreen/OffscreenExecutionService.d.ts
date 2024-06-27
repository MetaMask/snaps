import type { ExecutionServiceArgs } from '../AbstractExecutionService';
import { ProxyExecutionService } from '../proxy/ProxyExecutionService';
declare type OffscreenExecutionEnvironmentServiceArgs = {
    offscreenPromise: Promise<unknown>;
} & ExecutionServiceArgs;
export declare class OffscreenExecutionService extends ProxyExecutionService {
    #private;
    /**
     * Create a new offscreen execution service.
     *
     * @param args - The constructor arguments.
     * @param args.messenger - The messenger to use for communication with the
     * `SnapController`.
     * @param args.setupSnapProvider - The function to use to set up the snap
     * provider.
     * @param args.offscreenPromise - A promise that resolves when the offscreen
     * environment is ready.
     */
    constructor({ messenger, setupSnapProvider, offscreenPromise, }: OffscreenExecutionEnvironmentServiceArgs);
    /**
     * Create a new stream for the given job ID. This will wait for the offscreen
     * environment to be ready before creating the stream.
     *
     * @param jobId - The job ID to create a stream for.
     * @returns The stream for the given job ID.
     */
    protected initEnvStream(jobId: string): Promise<{
        worker: string;
        stream: import("..").ProxyPostMessageStream;
    }>;
}
export {};
