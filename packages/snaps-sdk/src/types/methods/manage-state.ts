import type { Json } from '@metamask/utils';

import type { EnumToUnion } from '../../internals';

export enum ManageStateOperation {
  ClearState = 'clear',
  GetState = 'get',
  UpdateState = 'update',
}

export type ClearStateOperation = {
  operation: EnumToUnion<ManageStateOperation.ClearState>;
  encrypted?: boolean;
};

export type GetStateOperation = {
  operation: EnumToUnion<ManageStateOperation.GetState>;
  encrypted?: boolean;
};

export type UpdateStateOperation = {
  operation: EnumToUnion<ManageStateOperation.UpdateState>;
  encrypted?: boolean;
  newState: Record<string, Json>;
};

export type ManageState =
  | ClearStateOperation
  | GetStateOperation
  | UpdateStateOperation;

/**
 * The request parameters for the `snap_manageState` method.
 *
 * @property operation - The operation to perform on the state.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state.
 * @property newState - The new state to set. Only applicable for the `set`
 * operation.
 */
export type ManageStateParams = ManageState;

/**
 * The result returned by the `snap_manageState` method.
 *
 * If the operation is `get`, the result is the state. Otherwise, the result is
 * `null`.
 */
export type ManageStateResult = Record<string, Json> | null;
