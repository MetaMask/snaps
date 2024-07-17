/// <reference types="node" />
import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import ObjectMultiplex from '@metamask/object-multiplex';
import type { BasePostMessageStream } from '@metamask/post-message-stream';
import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import type { Duplex } from 'readable-stream';
import { Timer } from '../snaps/Timer';
import type { ExecutionService, ExecutionServiceMessenger, SnapExecutionData } from './ExecutionService';
export declare type SetupSnapProvider = (snapId: string, stream: Duplex) => void;
export declare type ExecutionServiceArgs = {
    setupSnapProvider: SetupSnapProvider;
    messenger: ExecutionServiceMessenger;
    initTimeout?: number;
    pingTimeout?: number;
    terminationTimeout?: number;
    usePing?: boolean;
};
export declare type JobStreams = {
    command: Duplex;
    rpc: Duplex;
    _connection: BasePostMessageStream;
};
export declare type Job<WorkerType> = {
    id: string;
    streams: JobStreams;
    rpcEngine: JsonRpcEngine;
    worker: WorkerType;
};
export declare type TerminateJobArgs<WorkerType> = Partial<Job<WorkerType>> & Pick<Job<WorkerType>, 'id'>;
export declare abstract class AbstractExecutionService<WorkerType> implements ExecutionService {
    #private;
    protected jobs: Map<string, Job<WorkerType>>;
    private readonly setupSnapProvider;
    constructor({ setupSnapProvider, messenger, initTimeout, pingTimeout, terminationTimeout, usePing, }: ExecutionServiceArgs);
    /**
     * Constructor helper for registering the controller's messaging system
     * actions.
     */
    private registerMessageHandlers;
    /**
     * Performs additional necessary work during job termination. **MUST** be
     * implemented by concrete implementations. See
     * {@link AbstractExecutionService.terminate} for details.
     *
     * @param job - The object corresponding to the job to be terminated.
     */
    protected abstract terminateJob(job: TerminateJobArgs<WorkerType>): void;
    /**
     * Terminates the job with the specified ID and deletes all its associated
     * data. Any subsequent messages targeting the job will fail with an error.
     * Throws an error if the specified job does not exist, or if termination
     * fails unexpectedly.
     *
     * @param jobId - The id of the job to be terminated.
     */
    terminate(jobId: string): Promise<void>;
    /**
     * Initiates a job for a snap.
     *
     * @param jobId - The ID of the job to initiate.
     * @param timer - The timer to use for timeouts.
     * @returns Information regarding the created job.
     * @throws If the execution service returns an error or execution times out.
     */
    protected initJob(jobId: string, timer: Timer): Promise<Job<WorkerType>>;
    /**
     * Sets up the streams for an initiated job.
     *
     * @param jobId - The id of the job.
     * @param timer - The timer to use for timeouts.
     * @returns The streams to communicate with the worker and the worker itself.
     * @throws If the execution service returns an error or execution times out.
     */
    protected initStreams(jobId: string, timer: Timer): Promise<{
        streams: JobStreams;
        worker: WorkerType;
    }>;
    /**
     * Abstract function implemented by implementing class that spins up a new worker for a job.
     *
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     */
    protected abstract initEnvStream(jobId: string): Promise<{
        worker: WorkerType;
        stream: BasePostMessageStream;
    }>;
    /**
     * Terminates the Snap with the specified ID. May throw an error if
     * termination unexpectedly fails, but will not fail if no job for the snap
     * with the specified ID is found.
     *
     * @param snapId - The ID of the snap to terminate.
     */
    terminateSnap(snapId: string): Promise<void>;
    terminateAllSnaps(): Promise<void>;
    /**
     * Gets the RPC request handler for the given snap.
     *
     * @param snapId - The id of the Snap whose message handler to get.
     * @returns The RPC request handler for the snap.
     */
    private getRpcRequestHandler;
    /**
     * Initializes and executes a snap, setting up the communication channels to the snap etc.
     *
     * @param snapData - Data needed for Snap execution.
     * @param snapData.snapId - The ID of the Snap to execute.
     * @param snapData.sourceCode - The source code of the Snap to execute.
     * @param snapData.endowments - The endowments available to the executing Snap.
     * @returns A string `OK` if execution succeeded.
     * @throws If the execution service returns an error or execution times out.
     */
    executeSnap({ snapId, sourceCode, endowments, }: SnapExecutionData): Promise<string>;
    private command;
    /**
     * Handle RPC request.
     *
     * @param snapId - The ID of the recipient snap.
     * @param options - Bag of options to pass to the RPC handler.
     * @returns Promise that can handle the request.
     */
    handleRpcRequest(snapId: string, options: SnapRpcHookArgs): Promise<unknown>;
}
/**
 * Sets up stream multiplexing for the given stream.
 *
 * @param connectionStream - The stream to mux.
 * @param streamName - The name of the stream, for identification in errors.
 * @returns The multiplexed stream.
 */
export declare function setupMultiplex(connectionStream: Duplex, streamName: string): ObjectMultiplex;
