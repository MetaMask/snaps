import { Json } from '@metamask/controllers';
import { MetaMaskInpageProvider } from '@metamask/providers';
import { JsonRpcRequest } from '@metamask/types';
import { HandlerType, ChainId } from '@metamask/snap-utils';

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

export type OnTransactionResponse = {
  insights: { [key: string]: unknown };
};

// @todo improve type
export type OnTransactionHandler = (args: {
  origin: string;
  transaction: { [key: string]: unknown };
  chainId: ChainId;
}) => Promise<OnTransactionResponse>;

export type SnapRpcHookArgs = {
  origin: string;
  handler: HandlerType;
  request: Record<string, unknown>;
};

// The snap is the callee
export type SnapRpcHook = (options: SnapRpcHookArgs) => Promise<unknown>;

export type SnapProvider = MetaMaskInpageProvider;

export type ChainId = string;

export type ErrorJSON = {
  message: string;
  code: number;
  data?: Json;
};

export type SnapExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTransaction?: OnTransactionHandler;
};

type ObjectParameters<
  Type extends Record<string, (...args: any[]) => unknown>,
> = Parameters<Type[keyof Type]>;

export type SnapExportsParameters = ObjectParameters<SnapExports>;
