export * as utils from './utils';
export type { SnapConfig } from './config';
export {
  getDefaultConfiguration,
  SnapsStatsPlugin,
  SnapsWatchPlugin,
  SnapsBuiltInResolver,
  SnapsBundleWarningsPlugin,
} from './webpack';
export type {
  SnapsStatsPluginOptions,
  SnapsWatchPluginOptions,
  SnapsBuiltInResolverOptions,
  SnapsBundleWarningsPluginOptions,
} from './webpack';

// Re-exported from `snaps-cli` for convenience.
export { merge } from 'webpack-merge';
