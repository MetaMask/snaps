import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';
export declare type InternalMethodsMiddlewareHooks = {
    /**
     * A hook that returns the user's secret recovery phrase.
     *
     * @returns The user's secret recovery phrase.
     */
    getMnemonic: () => Promise<Uint8Array>;
};
/**
 * Create a middleware for handling JSON-RPC methods normally handled internally
 * by the MetaMask client.
 *
 * NOTE: This middleware provides all `hooks` to all handlers and should
 * therefore NOT be used outside of the simulation environment. It is intended
 * for testing purposes only.
 *
 * @param hooks - Any hooks used by the middleware handlers.
 * @returns A middleware function.
 */
export declare function createInternalMethodsMiddleware(hooks: InternalMethodsMiddlewareHooks): JsonRpcMiddleware<JsonRpcParams, Json>;
