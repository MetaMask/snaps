import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { BaseSnapExecutor } from '../../common/BaseSnapExecutor';
export declare class WebWorkerSnapExecutor extends BaseSnapExecutor {
    /**
     * Initialize the WebWorkerSnapExecutor. This creates a post message stream
     * from and to the parent window, for two-way communication with the iframe.
     *
     * @param stream - The stream to use for communication.
     * @returns An instance of `WebWorkerSnapExecutor`, with the initialized post
     * message streams.
     */
    static initialize(stream?: BasePostMessageStream): WebWorkerSnapExecutor;
}
