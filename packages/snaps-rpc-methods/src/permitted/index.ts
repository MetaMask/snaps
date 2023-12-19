import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetSnapsHooks } from './getSnaps';
import type { RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetAllSnapsHooks &
  GetClientStatusHooks &
  GetSnapsHooks &
  RequestSnapsHooks;

export * from './handlers';
export * from './middleware';
