import {
  SnapFunctionExports,
  SnapKeyring as Keyring,
} from '@metamask/snap-types';

/**
 * The possible prefixes for snap ids.
 */
export enum SnapIdPrefixes {
  npm = 'npm:',
  local = 'local:',
  http = 'http:',
  https = 'https:',
}

export type SnapId = string;

export enum SNAP_STREAM_NAMES {
  JSON_RPC = 'jsonRpc',
  COMMAND = 'command',
}

export enum HandlerType {
  OnRpcRequest = 'onRpcRequest',
  OnTransaction = 'onTransaction',
  SnapKeyring = 'keyring',
  OnCronjob = 'onCronjob',
}

export const SNAP_EXPORT_NAMES = Object.values(HandlerType);

export type SnapRpcHookArgs = {
  origin: string;
  handler: HandlerType;
  request: Record<string, unknown>;
};

// The snap is the callee
export type SnapRpcHook = (options: SnapRpcHookArgs) => Promise<unknown>;

type ObjectParameters<
  Type extends Record<string, (...args: any[]) => unknown>,
> = Parameters<Type[keyof Type]>;

type KeyringParameter<Fn> = Fn extends (...args: any[]) => unknown
  ? Parameters<Fn>
  : never;

type KeyringParameters = KeyringParameter<Keyring[keyof Keyring]>;

export type SnapExportsParameters =
  | ObjectParameters<SnapFunctionExports>
  | KeyringParameters;
