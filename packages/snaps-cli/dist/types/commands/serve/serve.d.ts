import type { ProcessedConfig } from '../../config';
declare type ServeOptions = {
    /**
     * The port to listen on.
     */
    port: number;
};
/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param config - The config object.
 * @param options - The options object.
 */
export declare function serveHandler(config: ProcessedConfig, options: ServeOptions): Promise<void>;
export {};
