export type { PermittedRpcMethodHooks } from './permitted';
export {
  handlers as permittedMethods,
  createSnapsMethodMiddleware,
  FileEncoding,
} from './permitted';
export * from './restricted';
export { SnapCaveatType } from '@metamask/snaps-utils';
export { selectHooks } from './utils';
export type { RequestFunction, SnapsGlobalObject } from './request';
