import { RestrictedControllerMessenger } from '@metamask/controllers';
import { SnapId, SnapRpcHookArgs } from '@metamask/snap-utils';
import { Json } from '@metamask/types';
declare type TerminateSnap = (snapId: string) => Promise<void>;
declare type TerminateAll = () => Promise<void>;
declare type ExecuteSnap = (snapData: SnapExecutionData) => Promise<unknown>;
declare type HandleRpcRequest = (snapId: string, options: SnapRpcHookArgs) => Promise<unknown>;
export interface ExecutionService {
    terminateSnap: TerminateSnap;
    terminateAllSnaps: TerminateAll;
    executeSnap: ExecuteSnap;
    handleRpcRequest: HandleRpcRequest;
}
export declare type SnapExecutionData = {
    snapId: string;
    sourceCode: string;
    endowments?: Json;
};
export declare type SnapErrorJson = {
    message: string;
    code: number;
    data?: Json;
};
declare const controllerName = "ExecutionService";
export declare type ErrorMessageEvent = {
    type: 'ExecutionService:unhandledError';
    payload: [SnapId, SnapErrorJson];
};
export declare type OutboundRequest = {
    type: 'ExecutionService:outboundRequest';
    payload: [SnapId];
};
export declare type OutboundResponse = {
    type: 'ExecutionService:outboundResponse';
    payload: [SnapId];
};
export declare type ExecutionServiceEvents = ErrorMessageEvent | OutboundRequest | OutboundResponse;
/**
 * Handles RPC request.
 */
export declare type HandleRpcRequestAction = {
    type: `${typeof controllerName}:handleRpcRequest`;
    handler: ExecutionService['handleRpcRequest'];
};
/**
 * Executes a given snap.
 */
export declare type ExecuteSnapAction = {
    type: `${typeof controllerName}:executeSnap`;
    handler: ExecutionService['executeSnap'];
};
/**
 * Terminates a given snap.
 */
export declare type TerminateSnapAction = {
    type: `${typeof controllerName}:terminateSnap`;
    handler: ExecutionService['terminateSnap'];
};
/**
 * Terminates all snaps.
 */
export declare type TerminateAllSnapsAction = {
    type: `${typeof controllerName}:terminateAllSnaps`;
    handler: ExecutionService['terminateAllSnaps'];
};
export declare type ExecutionServiceActions = HandleRpcRequestAction | ExecuteSnapAction | TerminateSnapAction | TerminateAllSnapsAction;
export declare type ExecutionServiceMessenger = RestrictedControllerMessenger<'ExecutionService', ExecutionServiceActions, ExecutionServiceEvents, ExecutionServiceActions['type'], ExecutionServiceEvents['type']>;
export {};
