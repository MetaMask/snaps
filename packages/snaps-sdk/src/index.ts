// Only internals that are used by other Snaps packages should be exported here.
export type { EnumToUnion } from './internals';
export {
  getErrorData,
  getErrorMessage,
  getErrorStack,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
} from './internals';

export * from './errors';
export * from './types';
