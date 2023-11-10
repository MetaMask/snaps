// Only internals that are used by other Snaps packages should be exported here.
export type { EnumToUnion } from './internals';
export {
  getErrorData,
  getErrorMessage,
  getErrorStack,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
} from './internals';

// Re-exported from `@metamask/utils` for convenience.
export type {
  Json,
  JsonRpcError,
  JsonRpcRequest,
  JsonRpcParams,
} from '@metamask/utils';

export * from './errors';
export * from './types';
