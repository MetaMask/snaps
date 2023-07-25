import type { Component } from '@metamask/snaps-ui';
import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';

export enum HandlerType {
  OnRpcRequest = 'onRpcRequest',
  OnTransaction = 'onTransaction',
  OnCronjob = 'onCronjob',
  OnInstall = 'onInstall',
  OnUpdate = 'onUpdate',
}

type SnapHandler = {
  /**
   * The type of handler.
   */
  type: HandlerType;

  /**
   * Whether the handler is required, i.e., whether the request will fail if the
   * handler is called, but the snap does not export it.
   *
   * This is primarily used for the lifecycle handlers, which are optional.
   */
  required: boolean;

  /**
   * Validate the given snap export. This should return a type guard for the
   * handler type.
   *
   * @param snapExport - The export to validate.
   * @returns Whether the export is valid.
   */
  validator: (snapExport: unknown) => boolean;
};

export const SNAP_EXPORTS = {
  [HandlerType.OnRpcRequest]: {
    type: HandlerType.OnRpcRequest,
    required: true,
    validator: (snapExport: unknown): snapExport is OnRpcRequestHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnTransaction]: {
    type: HandlerType.OnTransaction,
    required: true,
    validator: (snapExport: unknown): snapExport is OnTransactionHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnCronjob]: {
    type: HandlerType.OnCronjob,
    required: true,
    validator: (snapExport: unknown): snapExport is OnCronjobHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnInstall]: {
    type: HandlerType.OnInstall,
    required: false,
    validator: (snapExport: unknown): snapExport is OnInstallHandler => {
      return typeof snapExport === 'function';
    },
  },
  [HandlerType.OnUpdate]: {
    type: HandlerType.OnUpdate,
    required: false,
    validator: (snapExport: unknown): snapExport is OnUpdateHandler => {
      return typeof snapExport === 'function';
    },
  },
} as const;

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
export type OnRpcRequestHandler<Params extends JsonRpcParams = JsonRpcParams> =
  (args: {
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
export type OnCronjobHandler<Params extends JsonRpcParams = JsonRpcParams> =
  (args: { request: JsonRpcRequest<Params> }) => Promise<unknown>;

/**
 * A handler that can be used for the lifecycle hooks.
 */
export type LifecycleEventHandler = (args: {
  request: JsonRpcRequest;
}) => Promise<unknown>;

/**
 * The `onInstall` handler. This is called after the snap is installed.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 */
export type OnInstallHandler = LifecycleEventHandler;

/**
 * The `onUpdate` handler. This is called after the snap is updated.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 */
export type OnUpdateHandler = LifecycleEventHandler;

/**
 * Utility type for getting the handler function type from a handler type.
 */
export type HandlerFunction<Type extends SnapHandler> =
  Type['validator'] extends (snapExport: unknown) => snapExport is infer Handler
    ? Handler
    : never;

/**
 * All the function-based handlers that a snap can implement.
 */
export type SnapFunctionExports = {
  [Key in keyof typeof SNAP_EXPORTS]?: HandlerFunction<
    typeof SNAP_EXPORTS[Key]
  >;
};

/**
 * All handlers that a snap can implement.
 */
export type SnapExports = SnapFunctionExports;
