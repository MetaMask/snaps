import type { Messenger } from '@metamask/messenger';
import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';

import type { ExecutionServiceMethodActions } from './ExecutionService-method-action-types';

type TerminateSnap = (snapId: string) => Promise<void>;
type TerminateAll = () => Promise<void>;
type ExecuteSnap = (snapData: SnapExecutionData) => Promise<unknown>;

type HandleRpcRequest = (
  snapId: string,
  options: SnapRpcHookArgs,
) => Promise<unknown>;

export const MESSENGER_EXPOSED_METHODS = [
  'terminateSnap',
  'terminateAllSnaps',
  'executeSnap',
  'handleRpcRequest',
] as const;

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

export type ExecutionServiceUnhandledErrorEvent = {
  type: 'ExecutionService:unhandledError';
  payload: [string, SnapErrorJson];
};

export type ExecutionServiceOutboundRequestEvent = {
  type: 'ExecutionService:outboundRequest';
  payload: [string];
};

export type ExecutionServiceOutboundResponseEvent = {
  type: 'ExecutionService:outboundResponse';
  payload: [string];
};

export type ExecutionServiceEvents =
  | ExecutionServiceUnhandledErrorEvent
  | ExecutionServiceOutboundRequestEvent
  | ExecutionServiceOutboundResponseEvent;

export type ExecutionServiceActions = ExecutionServiceMethodActions;

export type ExecutionServiceMessenger = Messenger<
  'ExecutionService',
  ExecutionServiceActions,
  ExecutionServiceEvents
>;
