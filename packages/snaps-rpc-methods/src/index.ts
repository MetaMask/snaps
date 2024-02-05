export {
  handlers as permittedMethods,
  createSnapsMethodMiddleware,
} from './permitted';
export type { PermittedRpcMethodHooks } from './permitted';
export { SnapCaveatType } from '@metamask/snaps-utils';
export { selectHooks } from './utils';
export * from './endowments';
export * from './permissions';
export * from './restricted';
