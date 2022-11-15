import { getSnapsHandler, GetSnapsHooks } from './getSnaps';
import { invokeSnapSugarHandler } from './invokeSnapSugar';
import { requestSnapsHandler, RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetSnapsHooks & RequestSnapsHooks;

export const handlers = [
  getSnapsHandler,
  requestSnapsHandler,
  invokeSnapSugarHandler,
];
