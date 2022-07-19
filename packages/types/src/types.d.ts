import { Json } from '@metamask/controllers';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { JsonRpcRequest } from '@metamask/types';

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
  request: JsonRpcRequest<unknown[] | { [key: string]: unknown }>;
}) => Promise<unknown>;

export type OnRpcRequestHandler = SnapRpcHandler;

// @todo improve type
export type OnTxConfirmationHandler = (args: {
  origin: string;
  transaction: { [key: string]: unknown };
}) => Promise<string>;

export type SnapProvider = MetaMaskInpageProvider;

export type SnapId = string;

export type ErrorJSON = {
  message: string;
  code: number;
  data?: Json;
};

export type SnapExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTxConfirmation?: OnTxConfirmationHandler;
};

export type HandlerType = keyof SnapExports;
