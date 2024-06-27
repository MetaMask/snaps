import type { ProcessedConfig } from '../../config';
/**
 * Build all files in the given source directory to the given destination
 * directory.
 *
 * This creates the destination directory if it doesn't exist.
 *
 * @param config - The config object.
 */
export declare function buildHandler(config: ProcessedConfig): Promise<void>;
