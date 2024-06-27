import type { ProcessedConfig } from '../../config';
declare type WatchOptions = {
    /**
     * The port to listen on.
     */
    port?: number;
};
/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param config - The config object.
 * @param options - The options object.
 */
export declare function watchHandler(config: ProcessedConfig, options: WatchOptions): Promise<void>;
export {};
