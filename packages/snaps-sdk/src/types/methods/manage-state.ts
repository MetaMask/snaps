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
