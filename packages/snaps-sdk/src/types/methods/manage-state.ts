import type { Json } from '@metamask/utils';

import type { EnumToUnion } from '../../internals';

/**
 * The operations that can be performed on the state.
 */
export enum ManageStateOperation {
  ClearState = 'clear',
  GetState = 'get',
  UpdateState = 'update',
}

/**
 * The `clear` operation, which deletes all stored state.
 */
export type ClearStateOperation = {
  /**
   * The literal string "clear" to indicate that this is a clear operation.
   */
  operation: EnumToUnion<ManageStateOperation.ClearState>;

  /**
   * Whether to use the encrypted or unencrypted state. Defaults to `true`
   * (encrypted). Encrypted state is only accessible when the wallet is
   * unlocked, while unencrypted state is accessible whether the wallet is
   * locked or unlocked. State can be cleared regardless of the wallet's lock
   * state, but this parameter determines which state is cleared.
   */
  encrypted?: boolean;
};

/**
 * The `get` operation, which retrieves the stored state.
 */
export type GetStateOperation = {
  /**
   * The literal string "get" to indicate that this is a get operation.
   */
  operation: EnumToUnion<ManageStateOperation.GetState>;

  /**
   * Whether to use the encrypted or unencrypted state. Defaults to `true`
   * (encrypted). Encrypted state is only accessible when the wallet is
   * unlocked, while unencrypted state is accessible whether the wallet is
   * locked or unlocked.
   */
  encrypted?: boolean;
};

/**
 * The `update` operation, which replaces the stored state with a new value.
 */
export type UpdateStateOperation = {
  /**
   * The literal string "update" to indicate that this is an update operation.
   */
  operation: EnumToUnion<ManageStateOperation.UpdateState>;

  /**
   * Whether to use the encrypted or unencrypted state. Defaults to `true`
   * (encrypted). Encrypted state is only accessible when the wallet is
   * unlocked, while unencrypted state is accessible whether the wallet is
   * locked or unlocked.
   */
  encrypted?: boolean;

  /**
   * The new state to store. Must be a JSON-serializable object.
   */
  newState: Record<string, Json>;
};

/**
 * An object containing the parameters for the `snap_manageState` method.
 */
export type ManageStateParams =
  | ClearStateOperation
  | GetStateOperation
  | UpdateStateOperation;

/**
 * If the operation is `get`, the result is the state. Otherwise, the result is
 * `null`.
 */
export type ManageStateResult = Record<string, Json> | null;
