import type { ProcessedConfig } from '../../config';
declare type ManifestOptions = {
    fix?: boolean;
};
/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param config - The config object.
 * @param options - The options object.
 */
export declare function manifestHandler(config: ProcessedConfig, options: ManifestOptions): Promise<void>;
export {};
