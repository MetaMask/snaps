export * as utils from './utils';
export type { SnapConfig } from './config';
export { getDefaultConfiguration, SnapsStatsPlugin, SnapsWatchPlugin, SnapsBuiltInResolver, SnapsBundleWarningsPlugin, } from './webpack';
export type { SnapsStatsPluginOptions, SnapsWatchPluginOptions, SnapsBuiltInResolverOptions, SnapsBundleWarningsPluginOptions, } from './webpack';
export { merge, mergeWithCustomize, mergeWithRules } from 'webpack-merge';
