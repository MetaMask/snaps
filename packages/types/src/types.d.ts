import { MetaMaskInpageProvider } from '@metamask/providers';
import { Json, JsonRpcRequest } from '@metamask/types';

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

// CAIP2 - https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
type ChainId = string;
// CAIP10 - https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md
type AccountId = string;

type RequestArguments = {
  method: string;
  params: unknown[];
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface SnapKeyring {
  getAccounts(): Promise<AccountId[]>;
  handleRequest(data: {
    chainId: ChainId;
    origin: string;
    request: RequestArguments;
  }): Promise<Json>;
  on(
    data: {
      chainId: ChainId;
      origin: string;
      eventName: string;
    },
    listener: (...args: unknown[]) => void,
  ): void;
  off(data: { chainId: ChainId; origin: string; eventName: string }): void;

  addAccount?(chainId: ChainId): Promise<AccountId>;
  removeAccount?(accountId: AccountId): Promise<void>;

  importAccount?(chainId: ChainId, data: Json): Promise<AccountId>;
  exportAccount?(accountId: AccountId): Promise<Json>;
}

export type SnapFunctionExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTransaction?: OnTransactionHandler;
};

export type SnapExports = SnapFunctionExports & {
  keyring?: SnapKeyring;
};
