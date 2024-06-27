import type { PostMessageEvent } from '@metamask/post-message-stream';
import { BasePostMessageStream } from '@metamask/post-message-stream';
export declare type WebViewInterface = {
    injectJavaScript(js: string): void;
    registerMessageListener(listener: (event: PostMessageEvent) => void): void;
    unregisterMessageListener(listener: (event: PostMessageEvent) => void): void;
};
declare type WebViewStreamArgs = {
    name: string;
    target: string;
    getWebView: () => Promise<WebViewInterface>;
};
/**
 * A special postMessage stream used to interface with a WebView.
 */
export declare class WebViewMessageStream extends BasePostMessageStream {
    #private;
    /**
     * Creates a stream for communicating with other streams inside a WebView.
     *
     * @param args - Options bag.
     * @param args.name - The name of the stream. Used to differentiate between
     * multiple streams sharing the same window object.
     * @param args.target - The name of the stream to exchange messages with.
     * @param args.getWebView - A asynchronous getter for the webview.
     */
    constructor({ name, target, getWebView }: WebViewStreamArgs);
    protected _postMessage(data: unknown): void;
    private _onMessage;
    _destroy(): void;
}
export {};
