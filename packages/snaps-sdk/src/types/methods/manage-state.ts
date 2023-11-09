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
 * The clear state operation, which clears the state.
 *
 * @property operation - The operation to perform on the state. Must be `clear`.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the extension is unlocked, while unencrypted state can be used
 * whether the extension is locked or unlocked.
 */
export type ClearStateOperation = {
  operation: EnumToUnion<ManageStateOperation.ClearState>;
  encrypted?: boolean;
};

/**
 * The get state operation, which retrieves the state.
 *
 * @property operation - The operation to perform on the state. Must be `get`.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the extension is unlocked, while unencrypted state can be used
 * whether the extension is locked or unlocked.
 */
export type GetStateOperation = {
  operation: EnumToUnion<ManageStateOperation.GetState>;
  encrypted?: boolean;
};

/**
 * The update state operation, which updates the state.
 *
 * @property operation - The operation to perform on the state. Must be
 * `update`.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the extension is unlocked, while unencrypted state can be used
 * whether the extension is locked or unlocked.
 * @property newState - The new state to set.
 */
export type UpdateStateOperation = {
  operation: EnumToUnion<ManageStateOperation.UpdateState>;
  encrypted?: boolean;
  newState: Record<string, Json>;
};

/**
 * The request parameters for the `snap_manageState` method.
 *
 * @property operation - The operation to perform on the state.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state.
 * @property newState - The new state to set. Only applicable for the `set`
 * operation.
 */
export type ManageStateParams =
  | ClearStateOperation
  | GetStateOperation
  | UpdateStateOperation;

/**
 * The result returned by the `snap_manageState` method.
 *
 * If the operation is `get`, the result is the state. Otherwise, the result is
 * `null`.
 */
export type ManageStateResult = Record<string, Json> | null;
