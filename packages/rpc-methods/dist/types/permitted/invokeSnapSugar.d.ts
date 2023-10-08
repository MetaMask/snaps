import type { PermittedHandlerExport, JsonRpcRequest, JsonRpcEngineNextCallback, JsonRpcEngineEndCallback } from '@metamask/types';
export declare type InvokeSnapSugarArgs = {
    snapId: string;
    request: Record<string, unknown>;
};
/**
 * `wallet_invokeSnap` attempts to invoke an RPC method of the specified Snap.
 */
export declare const invokeSnapSugarHandler: PermittedHandlerExport<void, JsonRpcRequest<unknown>, unknown>;
/**
 * The `wallet_invokeSnap` method implementation.
 * Reroutes incoming JSON-RPC requests that are targeting snaps, by modifying the method and params.
 *
 * @param req - The JSON-RPC request object.
 * @param _res - The JSON-RPC response object. Not used by this
 * function.
 * @param next - The `json-rpc-engine` "next" callback.
 * @param end - The `json-rpc-engine` "end" callback.
 * @returns Nothing.
 * @throws If the params are invalid.
 */
export declare function invokeSnapSugar(req: JsonRpcRequest<unknown>, _res: unknown, next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback): void;
/**
 * Validates the wallet_invokeSnap method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
export declare function getValidatedParams(params: unknown): InvokeSnapSugarArgs;
