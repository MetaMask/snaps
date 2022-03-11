import { Json, RestrictedControllerMessenger } from '@metamask/controllers';
import { MetaMaskInpageProvider } from '@metamask/providers';

/**
 * Command request sent to a worker.
 */
export type WorkerCommandRequest = {
  id: string;
  command: string;
  data?: string | Record<string, unknown>;
};

export type SnapData = {
  snapId: string;
  sourceCode: string;
};

export type SnapExecutionData = SnapData & {
  endowments?: Json;
};

export type SnapRpcHandler = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

export type SnapProvider = {
  registerRpcMessageHandler: (handler: SnapRpcHandler) => void;
} & MetaMaskInpageProvider;

export type SnapId = string;

export type ErrorJSON = {
  message: string;
  code: number;
  data?: Json;
};

export type ErrorMessageEvent = {
  type: 'ExecutionService:unhandledError';
  payload: [SnapId, ErrorJSON];
};

export type UnresponsiveMessageEvent = {
  type: 'ExecutionService:unresponsive';
  payload: [SnapId];
};

export type ExecutionServiceMessenger = RestrictedControllerMessenger<
  'ExecutionService',
  never,
  ErrorMessageEvent | UnresponsiveMessageEvent,
  never,
  ErrorMessageEvent['type'] | UnresponsiveMessageEvent['type']
>;
