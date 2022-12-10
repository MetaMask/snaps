/// <reference types="node" />
import { Duplex } from 'stream';
import ObjectMultiplex from '@metamask/object-multiplex';
import { SnapRpcHook, SnapRpcHookArgs } from '@metamask/snap-utils';
import { JsonRpcEngine, JsonRpcRequest } from 'json-rpc-engine';
import { BasePostMessageStream } from '@metamask/post-message-stream';
import { ExecutionService, ExecutionServiceMessenger, SnapExecutionData } from './ExecutionService';
export declare type SetupSnapProvider = (snapId: string, stream: Duplex) => void;
export declare type ExecutionServiceArgs = {
    setupSnapProvider: SetupSnapProvider;
    messenger: ExecutionServiceMessenger;
    terminationTimeout?: number;
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
export declare abstract class AbstractExecutionService<WorkerType> implements ExecutionService {
    protected _snapRpcHooks: Map<string, SnapRpcHook>;
    protected jobs: Map<string, Job<WorkerType>>;
    protected setupSnapProvider: SetupSnapProvider;
    protected snapToJobMap: Map<string, string>;
    protected jobToSnapMap: Map<string, string>;
    protected _messenger: ExecutionServiceMessenger;
    protected _terminationTimeout: number;
    constructor({ setupSnapProvider, messenger, terminationTimeout, }: ExecutionServiceArgs);
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
    protected abstract _terminate(job: Job<WorkerType>): void;
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
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     *
     * @returns Information regarding the created job.
     */
    protected _initJob(): Promise<Job<WorkerType>>;
    /**
     * Sets up the streams for an initiated job.
     *
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     *
     * @param jobId - The id of the job.
     * @returns The streams to communicate with the worker and the worker itself.
     */
    protected _initStreams(jobId: string): Promise<{
        streams: JobStreams;
        worker: WorkerType;
    }>;
    /**
     * Abstract function implemented by implementing class that spins up a new worker for a job.
     *
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     */
    protected abstract _initEnvStream(jobId: string): Promise<{
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
     * Depending on the execution environment, this may run forever if the Snap fails to start up properly, therefore any call to this function should be wrapped in a timeout.
     *
     * @param snapData - Data needed for Snap execution.
     * @returns A string `OK` if execution succeeded.
     * @throws If the execution service returns an error.
     */
    executeSnap(snapData: SnapExecutionData): Promise<string>;
    protected _command(jobId: string, message: JsonRpcRequest<unknown>): Promise<unknown>;
    protected _removeSnapHooks(snapId: string): void;
    protected _createSnapHooks(snapId: string, workerId: string): void;
    /**
     * Gets the job id for a given snap.
     *
     * @param snapId - A given snap id.
     * @returns The ID of the snap's job.
     */
    protected _getJobForSnap(snapId: string): string | undefined;
    /**
     * Gets the snap id for a given job.
     *
     * @param jobId - A given job id.
     * @returns The ID of the snap that is running the job.
     */
    _getSnapForJob(jobId: string): string | undefined;
    protected _mapSnapAndJob(snapId: string, jobId: string): void;
    protected _removeSnapAndJobMapping(jobId: string): void;
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
