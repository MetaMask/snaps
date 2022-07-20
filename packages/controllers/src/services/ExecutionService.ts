import { RestrictedControllerMessenger } from '@metamask/controllers';
import { SnapExecutionData, SnapId, ErrorJSON } from '@metamask/snap-types';
import { SnapRpcHookArgs } from './AbstractExecutionService';

type TerminateSnap = (snapId: string) => Promise<void>;
type TerminateAll = () => Promise<void>;
type ExecuteSnap = (snapData: SnapExecutionData) => Promise<unknown>;
type HandleRpcRequest = (
  snapId: string,
  options: SnapRpcHookArgs,
) => Promise<unknown>;

export interface ExecutionService {
  terminateSnap: TerminateSnap;
  terminateAllSnaps: TerminateAll;
  executeSnap: ExecuteSnap;
  handleRpcRequest: HandleRpcRequest;
}

const controllerName = 'ExecutionService';

export type ErrorMessageEvent = {
  type: 'ExecutionService:unhandledError';
  payload: [SnapId, ErrorJSON];
};

export type OutboundRequest = {
  type: 'ExecutionService:outboundRequest';
  payload: [SnapId];
};

export type OutboundResponse = {
  type: 'ExecutionService:outboundResponse';
  payload: [SnapId];
};

export type ExecutionServiceEvents =
  | ErrorMessageEvent
  | OutboundRequest
  | OutboundResponse;

/**
 * Handles RPC request.
 */
export type HandleRpcRequestAction = {
  type: `${typeof controllerName}:handleRpcRequest`;
  handler: ExecutionService['handleRpcRequest'];
};

/**
 * Executes a given snap.
 */
export type ExecuteSnapAction = {
  type: `${typeof controllerName}:executeSnap`;
  handler: ExecutionService['executeSnap'];
};

/**
 * Terminates a given snap.
 */
export type TerminateSnapAction = {
  type: `${typeof controllerName}:terminateSnap`;
  handler: ExecutionService['terminateSnap'];
};

/**
 * Terminates all snaps.
 */
export type TerminateAllSnapsAction = {
  type: `${typeof controllerName}:terminateAllSnaps`;
  handler: ExecutionService['terminateAllSnaps'];
};

export type ExecutionServiceActions =
  | HandleRpcRequestAction
  | ExecuteSnapAction
  | TerminateSnapAction
  | TerminateAllSnapsAction;

export type ExecutionServiceMessenger = RestrictedControllerMessenger<
  'ExecutionService',
  ExecutionServiceActions,
  ExecutionServiceEvents,
  ExecutionServiceActions['type'],
  ExecutionServiceEvents['type']
>;
