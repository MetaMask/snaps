import type { Messenger } from '@metamask/messenger';
import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';

type TerminateSnap = (snapId: string) => Promise<void>;
type TerminateAll = () => Promise<void>;
type ExecuteSnap = (snapData: SnapExecutionData) => Promise<unknown>;

type HandleRpcRequest = (
  snapId: string,
  options: SnapRpcHookArgs,
) => Promise<unknown>;

export type ExecutionService = {
  // These fields are required for modular initialisation of the execution
  // service in the MetaMask extension.
  name: 'ExecutionService';
  state: null;

  terminateSnap: TerminateSnap;
  terminateAllSnaps: TerminateAll;
  executeSnap: ExecuteSnap;
  handleRpcRequest: HandleRpcRequest;
};

export type SnapExecutionData = {
  snapId: string;
  sourceCode: string;
  endowments: Json;
};

export type SnapErrorJson = {
  message: string;
  code: number;
  data?: Json;
};

type ControllerName = 'ExecutionService';

export type ErrorMessageEvent = {
  type: 'ExecutionService:unhandledError';
  payload: [string, SnapErrorJson];
};

export type OutboundRequest = {
  type: 'ExecutionService:outboundRequest';
  payload: [string];
};

export type OutboundResponse = {
  type: 'ExecutionService:outboundResponse';
  payload: [string];
};

export type ExecutionServiceEvents =
  | ErrorMessageEvent
  | OutboundRequest
  | OutboundResponse;

/**
 * Handles RPC request.
 */
export type HandleRpcRequestAction = {
  type: `${ControllerName}:handleRpcRequest`;
  handler: ExecutionService['handleRpcRequest'];
};

/**
 * Executes a given snap.
 */
export type ExecuteSnapAction = {
  type: `${ControllerName}:executeSnap`;
  handler: ExecutionService['executeSnap'];
};

/**
 * Terminates a given snap.
 */
export type TerminateSnapAction = {
  type: `${ControllerName}:terminateSnap`;
  handler: ExecutionService['terminateSnap'];
};

/**
 * Terminates all snaps.
 */
export type TerminateAllSnapsAction = {
  type: `${ControllerName}:terminateAllSnaps`;
  handler: ExecutionService['terminateAllSnaps'];
};

export type ExecutionServiceActions =
  | HandleRpcRequestAction
  | ExecuteSnapAction
  | TerminateSnapAction
  | TerminateAllSnapsAction;

export type ExecutionServiceMessenger = Messenger<
  'ExecutionService',
  ExecutionServiceActions,
  ExecutionServiceEvents
>;
