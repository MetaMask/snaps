import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { requestSnapsHandler, RequestSnapsHooks } from './requestSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';

export type PermittedRpcMethodHooks = GetSnapsHooks & RequestSnapsHooks;

export const handlers = [
  getSnapsHandler,
  requestSnapsHandler,
  invokeSnapSugarHandler,
];
