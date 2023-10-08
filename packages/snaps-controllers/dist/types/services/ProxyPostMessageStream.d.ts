import { BasePostMessageStream } from '@metamask/post-message-stream';
import type { JsonRpcRequest } from '@metamask/utils';
export declare type ProxyPostMessageStreamArgs = {
    stream: BasePostMessageStream;
    jobId: string;
    extra?: Record<string, unknown>;
};
export declare type ProxyPostMessage = {
    jobId: string;
    data: JsonRpcRequest;
    extra?: Record<string, unknown>;
};
/**
 * A post message stream that wraps messages in a job ID, before sending them
 * over the underlying stream.
 */
export declare class ProxyPostMessageStream extends BasePostMessageStream {
    #private;
    /**
     * Initializes a new `ProxyPostMessageStream` instance.
     *
     * @param args - The constructor arguments.
     * @param args.stream - The underlying stream to use for communication.
     * @param args.jobId - The ID of the job this stream is associated with.
     * @param args.extra - Extra data to include in the post message.
     */
    constructor({ stream, jobId, extra }: ProxyPostMessageStreamArgs);
    /**
     * Write data to the underlying stream. This wraps the data in an object with
     * the job ID.
     *
     * @param data - The data to write.
     */
    _postMessage(data: ProxyPostMessage): void;
}
