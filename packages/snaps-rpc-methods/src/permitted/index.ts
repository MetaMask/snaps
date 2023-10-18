import type { GetSnapsHooks } from './getSnaps';
import type { RequestSnapsHooks } from './requestSnaps';

export type PermittedRpcMethodHooks = GetSnapsHooks & RequestSnapsHooks;

export * from './handlers';
export * from './middleware';
