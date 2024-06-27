import type { Ora } from 'ora';
import type { Compiler, ResolvePluginInstance, Resolver, WebpackPluginInstance } from 'webpack';
export declare type SnapsStatsPluginOptions = {
    /**
     * Whether to log the verbose stats.
     */
    verbose?: boolean;
};
/**
 * A plugin that logs the stats after compilation. This is useful for logging
 * the number of files compiled, and the time taken to compile them.
 */
export declare class SnapsStatsPlugin implements WebpackPluginInstance {
    #private;
    /**
     * The options for the plugin.
     */
    readonly options: SnapsStatsPluginOptions;
    constructor(options?: SnapsStatsPluginOptions, spinner?: Ora);
    /**
     * Apply the plugin to the Webpack compiler.
     *
     * @param compiler - The Webpack compiler.
     */
    apply(compiler: Compiler): void;
}
/**
 * The options for the {@link SnapsWatchPlugin}.
 */
export declare type SnapsWatchPluginOptions = {
    /**
     * The bundle path. This is the file that will be evaluated, if the `evaluate`
     * option is set.
     */
    bundle?: string;
    /**
     * Whether to evaluate the bundle. This only applies if the `bundle` option is
     * set.
     */
    evaluate?: boolean;
    /**
     * The extra files to watch.
     */
    files?: string[];
};
/**
 * A plugin that adds extra files to watch. This is useful for watching files
 * that are not imported by the entry point, such as the `snap.manifest.json`
 * file.
 */
export declare class SnapsWatchPlugin implements WebpackPluginInstance {
    #private;
    /**
     * The options for the plugin.
     */
    readonly options: SnapsWatchPluginOptions;
    constructor(options: SnapsWatchPluginOptions, spinner?: Ora);
    /**
     * Apply the plugin to the Webpack compiler.
     *
     * @param compiler - The Webpack compiler.
     */
    apply(compiler: Compiler): void;
}
/**
 * The options for the {@link SnapsBuiltInResolver}.
 */
export declare type SnapsBuiltInResolverOptions = {
    /**
     * The built-in modules to ignore.
     */
    ignore?: string[];
};
/**
 * A plugin that logs a message when a built-in module is not resolved. The
 * MetaMask Snaps CLI does not support built-in modules by default, and this
 * plugin is used to warn the user when they try to import a built-in module,
 * when no fallback is configured.
 */
export declare class SnapsBuiltInResolver implements ResolvePluginInstance {
    #private;
    /**
     * The built-in modules that have been imported, but not resolved.
     */
    readonly unresolvedModules: Set<string>;
    /**
     * The options for the plugin.
     */
    readonly options: SnapsBuiltInResolverOptions;
    constructor(options?: SnapsBuiltInResolverOptions, spinner?: Ora);
    /**
     * Apply the plugin to the Webpack resolver.
     *
     * @param resolver - The Webpack resolver.
     */
    apply(resolver: Resolver): void;
}
/**
 * The options for the {@link SnapsBundleWarningsPlugin}.
 */
export declare type SnapsBundleWarningsPluginOptions = {
    /**
     * The {@link SnapsBuiltInResolver} instance to use for detecting built-in
     * modules.
     */
    builtInResolver?: SnapsBuiltInResolver | false;
    /**
     * Whether to show warnings if built-in modules are used, but not provided by
     * Webpack's `fallback` configuration.
     */
    builtIns?: boolean;
    /**
     * Whether to show warnings if the `Buffer` global is used, but not provided
     * by Webpack's `DefinePlugin`.
     */
    buffer?: boolean;
};
/**
 * A plugin that logs a message when:
 *
 * - A built-in module is not resolved. The MetaMask Snaps CLI does not support
 * built-in modules by default, and this plugin is used to warn the user when
 * they try to import a built-in module, when no fallback is configured.
 * - A snap uses the `Buffer` global. The MetaMask Snaps CLI does not support
 * the `Buffer` global by default, and this plugin is used to warn the user when
 * they try to use the `Buffer` global.
 *
 * We use both a resolver and a plugin, because the resolver is used to detect
 * when a built-in module is imported, and the plugin is used to log a single
 * message when the compilation is complete. We can't do everything in a single
 * plugin, because the resolver doesn't have access to the compilation, and the
 * plugin doesn't have access to the resolver.
 */
export declare class SnapsBundleWarningsPlugin implements WebpackPluginInstance {
    #private;
    /**
     * The options for the plugin.
     */
    readonly options: SnapsBundleWarningsPluginOptions;
    constructor(options?: SnapsBundleWarningsPluginOptions);
    /**
     * Apply the plugin to the Webpack compiler.
     *
     * @param compiler - The Webpack compiler.
     */
    apply(compiler: Compiler): void;
}
