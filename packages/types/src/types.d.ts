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

export type SnapRpcHandler = (args: {
  origin: string;
  request: Record<string, unknown>;
}) => Promise<unknown>;

export type OnRpcRequestHandler = SnapRpcHandler;

export type SnapProvider = MetaMaskInpageProvider;

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

export type ExecutionServiceMessenger = RestrictedControllerMessenger<
  'ExecutionService',
  never,
  ErrorMessageEvent,
  never,
  ErrorMessageEvent['type']
>;
