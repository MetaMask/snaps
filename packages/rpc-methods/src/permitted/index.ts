import { GetSnapsHooks } from './getSnaps';
import { RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetSnapsHooks & RequestSnapsHooks;

export * from './handlers';
export * from './middleware';
