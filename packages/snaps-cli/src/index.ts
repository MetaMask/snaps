export * as utils from './utils';
export type { SnapConfig } from './config';
export {
  getDefaultConfiguration,
  SnapsWatchPlugin,
  SnapsBuiltInResolver,
} from './webpack';

// Re-exported from `snaps-cli` for convenience.
export { merge } from 'webpack-merge';
