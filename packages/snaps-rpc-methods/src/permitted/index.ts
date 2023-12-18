import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetSnapsHooks } from './getSnaps';
import type { RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetAllSnapsHooks &
  GetSnapsHooks &
  RequestSnapsHooks;

export * from './handlers';
export * from './middleware';
