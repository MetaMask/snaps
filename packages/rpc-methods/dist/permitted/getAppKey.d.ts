import { PermittedHandlerExport } from '@metamask/types';
/**
 * `snap_getAppKey` gets the Snap's app key.
 */
export declare const getAppKeyHandler: PermittedHandlerExport<GetAppKeyHooks, [
    string
], string>;
export declare type GetAppKeyHooks = {
    /**
     * A bound function that gets the app key for a particular snap.
     *
     * @param requestedAccount - The requested account to get the app key for, if
     * any.
     * @returns The requested app key.
     */
    getAppKey: (requestedAccount?: string) => Promise<string>;
    /**
     * Waits for the extension to be unlocked.
     *
     * @returns A promise that resolves once the extension is unlocked.
     */
    getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};
