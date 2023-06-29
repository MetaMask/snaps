export * as utils from './utils';
export type { SnapConfig } from './config';
export {
  getDefaultConfiguration,
  SnapsWatchPlugin,
  SnapsBuiltInResolver,
  SnapsBuiltInResolverPlugin,
  SnapsBundleWarningsPlugin,
} from './webpack';
export type {
  SnapsWatchPluginOptions,
  SnapsBuiltInResolverOptions,
  SnapsBundleWarningsPluginOptions,
} from './webpack';

// Re-exported from `snaps-cli` for convenience.
export { merge } from 'webpack-merge';
