import { MetaMaskInpageProvider } from '@metamask/providers';
import { JsonRpcRequest } from '@metamask/types';

export type SnapRpcHandler = (args: {
  origin: string;
  request: JsonRpcRequest<unknown[] | { [key: string]: unknown }>;
}) => Promise<unknown>;

export type OnRpcRequestHandler = SnapRpcHandler;

export type OnTransactionResponse = {
  insights: { [key: string]: unknown };
};

// TODO: improve type
export type OnTransactionHandler = (args: {
  origin: string;
  transaction: { [key: string]: unknown };
  chainId: string;
}) => Promise<OnTransactionResponse>;

export type SnapProvider = MetaMaskInpageProvider;

export type SnapExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTransaction?: OnTransactionHandler;
};
