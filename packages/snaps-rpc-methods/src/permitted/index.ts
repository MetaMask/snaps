import type { CreateInterfaceMethodHooks } from './createInterface';
import type { GetAllSnapsHooks } from './getAllSnaps';
import type { GetClientStatusHooks } from './getClientStatus';
import type { GetInterfaceStateMethodHooks } from './getInterfaceState';
import type { GetSnapsHooks } from './getSnaps';
import type { RequestSnapsHooks } from './requestSnaps';
import type { UpdateInterfaceMethodHooks } from './updateInterface';

export type PermittedRpcMethodHooks = GetAllSnapsHooks &
  GetClientStatusHooks &
  GetSnapsHooks &
  RequestSnapsHooks &
  CreateInterfaceMethodHooks &
  UpdateInterfaceMethodHooks &
  GetInterfaceStateMethodHooks;

export * from './handlers';
export * from './middleware';
