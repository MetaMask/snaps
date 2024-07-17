import type { JsonRpcEngineEndCallback, JsonRpcEngineNextCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { InvokeSnapParams, InvokeSnapResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
/**
 * `wallet_invokeSnap` attempts to invoke an RPC method of the specified Snap.
 */
export declare const invokeSnapSugarHandler: PermittedHandlerExport<InvokeSnapSugarHooks, InvokeSnapParams, InvokeSnapResult>;
export declare type InvokeSnapSugarHooks = {
    invokeSnap: (params: InvokeSnapParams) => Promise<InvokeSnapResult>;
};
/**
 * The `wallet_invokeSnap` method implementation.
 * Effectively calls `wallet_snap` under the hood.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.invokeSnap - A function to invoke a snap designated by its parameters,
 * bound to the requesting origin.
 * @returns Nothing.
 * @throws If the params are invalid.
 */
export declare function invokeSnapSugar(req: JsonRpcRequest<InvokeSnapParams>, res: PendingJsonRpcResponse<InvokeSnapResult>, _next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback, { invokeSnap }: InvokeSnapSugarHooks): Promise<void>;
/**
 * Validates the wallet_invokeSnap method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
export declare function getValidatedParams(params: unknown): InvokeSnapParams;
