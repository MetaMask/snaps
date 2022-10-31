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
  transaction: { [key: string]: unknown };
  chainId: string;
}) => Promise<OnTransactionResponse>;

export type OnCronjobHandler = (args: {
  request: JsonRpcRequest<unknown[] | { [key: string]: unknown }>;
}) => Promise<unknown>;

export type SnapProvider = MetaMaskInpageProvider;

// CAIP2 - https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
type ChainId = `${string}:${string | number}`;
// CAIP10 - https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-10.md
type AccountId = `${ChainId}:${string}`;

export type RequestArguments = Pick<
  JsonRpcRequest<{ [key: string]: unknown }>,
  'method' | 'params'
>;

export type KeyringRequest = {
  chainId: ChainId; // or `string`?
  origin: string;
};
export type KeyringEvent = KeyringRequest & { eventName: string };

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface SnapKeyring {
  getAccounts(): Promise<AccountId[]>;
  handleRequest(
    data: KeyringRequest & {
      request: RequestArguments;
    },
  ): Promise<Json>;
  on(data: KeyringEvent, listener: (...args: unknown[]) => void): void;
  off(data: KeyringEvent): void;

  addAccount?(chainId: ChainId): Promise<AccountId>;
  removeAccount?(accountId: AccountId): Promise<void>;

  importAccount?(chainId: ChainId, data: Json): Promise<AccountId>;
  exportAccount?(accountId: AccountId): Promise<Json>;
}

export type SnapFunctionExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTransaction?: OnTransactionHandler;
  onCronjob?: OnCronjobHandler;
};

export type SnapExports = SnapFunctionExports & {
  keyring?: SnapKeyring;
};
