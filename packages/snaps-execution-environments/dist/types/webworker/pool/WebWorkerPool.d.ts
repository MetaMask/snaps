import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { WebWorkerParentPostMessageStream } from '@metamask/post-message-stream';
declare type ExecutorJob = {
    id: string;
    worker: Worker;
    stream: WebWorkerParentPostMessageStream;
};
/**
 * A snap executor using the WebWorker API.
 *
 * This is not a traditional snap executor, as it does not execute snaps itself.
 * Instead, it creates a pool of webworkers for each snap execution, and sends
 * the snap execution request to the webworker. The webworker is responsible for
 * executing the snap.
 */
export declare class WebWorkerPool {
    #private;
    readonly pool: Worker[];
    readonly jobs: Map<string, ExecutorJob>;
    static initialize(stream?: BasePostMessageStream, url?: string, poolSize?: number): WebWorkerPool;
    constructor(stream: BasePostMessageStream, url: string, poolSize?: number);
}
export {};
