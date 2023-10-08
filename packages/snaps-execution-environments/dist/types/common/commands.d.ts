import { HandlerType } from '@metamask/snaps-utils';
import type { InvokeSnap, InvokeSnapArgs } from './BaseSnapExecutor';
import type { ExecuteSnap, JsonRpcRequestWithoutId, Ping, SnapRpc, Terminate } from './validation';
export declare type CommandMethodsMapping = {
    ping: Ping;
    terminate: Terminate;
    executeSnap: ExecuteSnap;
    snapRpc: SnapRpc;
};
/**
 * Formats the arguments for the given handler.
 *
 * @param origin - The origin of the request.
 * @param handler - The handler to pass the request to.
 * @param request - The request object.
 * @returns The formatted arguments.
 */
export declare function getHandlerArguments(origin: string, handler: HandlerType, request: JsonRpcRequestWithoutId): InvokeSnapArgs;
/**
 * Gets an object mapping internal, "command" JSON-RPC method names to their
 * implementations.
 *
 * @param startSnap - A function that starts a snap.
 * @param invokeSnap - A function that invokes the RPC method handler of a
 * snap.
 * @param onTerminate - A function that will be called when this executor is
 * terminated in order to handle cleanup tasks.
 * @returns An object containing the "command" method implementations.
 */
export declare function getCommandMethodImplementations(startSnap: (...args: Parameters<ExecuteSnap>) => Promise<void>, invokeSnap: InvokeSnap, onTerminate: () => void): CommandMethodsMapping;
