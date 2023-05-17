import { Component } from '@metamask/snaps-ui';
import { Json, JsonRpcRequest } from '@metamask/utils';

import { AccountId, ChainId, RequestArguments } from './namespace';

/**
 * The `onRpcRequest` handler. This is called whenever a JSON-RPC request is
 * made to the snap.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin of the request. This can be the ID of another
 * snap, or the URL of a dapp.
 * @param args.request - The JSON-RPC request sent to the snap.
 * @returns The JSON-RPC response. This must be a JSON-serializable value.
 */
export type OnRpcRequestHandler<
  Params extends Json[] | Record<string, Json> | undefined =
    | Json[]
    | Record<string, Json>
    | undefined,
> = (args: {
  origin: string;
  request: JsonRpcRequest<Params>;
}) => Promise<unknown>;

/**
 * The response from a snap's `onTransaction` handler.
 *
 * @property content - A custom UI component, that will be shown in MetaMask. Can be created using `@metamask/snaps-ui`.
 *
 * If the snap has no insights about the transaction, this should be `null`.
 */
export type OnTransactionResponse = {
  content: Component | null;
};

/**
 * The `onTransaction` handler. This is called whenever a transaction is
 * submitted to the snap. It can return insights about the transaction, which
 * will be displayed to the user.
 *
 * @param args - The request arguments.
 * @param args.transaction - The transaction object.
 * @param args.chainId - The CAIP-2 chain ID of the network the transaction is
 * being submitted to.
 * @param args.transactionOrigin - The origin of the transaction. This is the
 * URL of the dapp that submitted the transaction.
 * @returns Insights about the transaction. See {@link OnTransactionResponse}.
 */
// TODO: Improve type.
export type OnTransactionHandler = (args: {
  transaction: { [key: string]: Json };
  chainId: string;
  transactionOrigin?: string;
}) => Promise<OnTransactionResponse>;

/**
 * The `onCronjob` handler. This is called on a regular interval, as defined by
 * the snap's manifest.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the snap.
 */
export type OnCronjobHandler<
  Params extends Json[] | Record<string, Json> | undefined =
    | Json[]
    | Record<string, Json>
    | undefined,
> = (args: { request: JsonRpcRequest<Params> }) => Promise<unknown>;

/**
 * A request sent to the `handleRequest` handler of a snap keyring.
 *
 * @property chainId - The CAIP-2 chain ID of the network the request is being
 * made to.
 * @property origin - The origin of the request. This can be the ID of another
 * snap, or the URL of a dapp.
 */
export type KeyringRequest = {
  chainId: ChainId;
  origin: string;
};

/**
 * A keyring event, which consists of a {@link KeyringRequest}, combined with
 * the name of the event.
 */
export type KeyringEvent = KeyringRequest & { eventName: string };

/**
 * A snap keyring object, which can be exported as `keyring` in a snap.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface SnapKeyring {
  getAccounts(): Promise<AccountId[]>;
  handleRequest(
    data: KeyringRequest & {
      request: RequestArguments;
    },
  ): Promise<Json>;
  on(data: KeyringEvent, listener: (...args: Json[]) => void): void;
  off(data: KeyringEvent): void;

  addAccount?(chainId: ChainId): Promise<AccountId>;
  removeAccount?(accountId: AccountId): Promise<void>;

  importAccount?(chainId: ChainId, data: Json): Promise<AccountId>;
  exportAccount?(accountId: AccountId): Promise<Json>;
}

/**
 * All the function-based handlers that a snap can implement.
 */
export type SnapFunctionExports = {
  onRpcRequest?: OnRpcRequestHandler;
  onTransaction?: OnTransactionHandler;
  onCronjob?: OnCronjobHandler;
};

/**
 * All handlers that a snap can implement.
 */
export type SnapExports = SnapFunctionExports & {
  keyring?: SnapKeyring;
};
