import type { BasePostMessageStream } from '@metamask/post-message-stream';
import { WindowPostMessageStream } from '@metamask/post-message-stream';
declare type ExecutorJob = {
    id: string;
    window: Window;
    stream: WindowPostMessageStream;
};
/**
 * A snap executor using the Offscreen Documents API.
 *
 * This is not a traditional snap executor, as it does not execute snaps itself.
 * Instead, it creates an iframe window for each snap execution, and sends the
 * snap execution request to the iframe window. The iframe window is responsible
 * for executing the snap.
 *
 * Extensions can only have a single offscreen document, so this executor is
 * persisted between snap executions. The offscreen snap executor essentially
 * acts as a proxy between the extension and the iframe execution environment.
 *
 * @see https://developer.chrome.com/docs/extensions/reference/offscreen/
 */
export declare class OffscreenSnapExecutor {
    #private;
    readonly jobs: Record<string, ExecutorJob>;
    /**
     * Initialize the executor with the given stream. This is a wrapper around the
     * constructor.
     *
     * @param stream - The stream to use for communication.
     * @returns The initialized executor.
     */
    static initialize(stream: BasePostMessageStream): OffscreenSnapExecutor;
    constructor(stream: BasePostMessageStream);
}
export {};
