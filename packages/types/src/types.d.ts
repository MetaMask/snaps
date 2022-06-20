import { Json, RestrictedControllerMessenger } from '@metamask/controllers';
import { BIP44CoinTypeNode } from '@metamask/key-tree';
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

export interface SnapStorage {
  /**
   *
   */
  clear(): Promise<void>;

  /**
   *
   * @param keys
   */
  get(keys?: null): Promise<Record<string, any>>;
  get<K extends string>(key: K): Promise<Record<K, any>>;
  get<K extends Array<string>>(keys: K): Promise<Record<keyof K, any>>;
  get<K extends string>(
    keysWithDefaults: Record<K, unknown>,
  ): Promise<Record<K, any>>;

  remove(keys: string | string[]): Promise<void>;

  set(keys: Record<string, unknown>): Promise<void>;
}

export interface SnapMetamask {
  userConfirmation(params: {
    title: string;
    description?: string;
    content?: string;
  }): Promise<boolean>;
}

export interface SnapCrypto {
  appKey(): Promise<string>;
  bip44: {
    get(symbol: string): Promise<BIP44CoinTypeNode>;
    get(coinType: number): Promise<BIP44CoinTypeNode>;
  };
}
