import { MetaMaskInpageProvider } from '@metamask/providers';
import { JsonRpcRequest } from '@metamask/types';

export type ChainId = `0x${string}`;

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

export type SnapProvider = MetaMaskInpageProvider;

export type SnapExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTransaction?: OnTransactionHandler;
};
