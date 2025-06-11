import type { SNAP_EXPORTS } from './exports';

export type SnapRpcHookArgs = {
  origin: string;
  handler: HandlerType;
  request: Record<string, unknown>;
};

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
    (typeof SNAP_EXPORTS)[Key]
  >;
};

/**
 * All handlers that a snap can implement.
 */
export type SnapExports = SnapFunctionExports;

export enum HandlerType {
  OnRpcRequest = 'onRpcRequest',
  OnSignature = 'onSignature',
  OnTransaction = 'onTransaction',
  OnCronjob = 'onCronjob',
  OnInstall = 'onInstall',
  OnUpdate = 'onUpdate',
  OnNameLookup = 'onNameLookup',
  OnKeyringRequest = 'onKeyringRequest',
  OnHomePage = 'onHomePage',
  OnSettingsPage = 'onSettingsPage',
  OnUserInput = 'onUserInput',
  OnAssetsLookup = 'onAssetsLookup',
  OnAssetsConversion = 'onAssetsConversion',
  OnAssetHistoricalPrice = 'onAssetHistoricalPrice',
  OnProtocolRequest = 'onProtocolRequest',
  OnClientRequest = 'onClientRequest',
  OnWebSocketEvent = 'onWebSocketEvent',
}

export type SnapHandler = {
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
