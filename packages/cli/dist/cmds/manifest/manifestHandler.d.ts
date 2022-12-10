import { YargsArgs } from '../../types/yargs';
/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param argv - The Yargs `argv` object.
 * @param argv.writeManifest - Whether to write the fixed manifest to disk.
 */
export declare function manifestHandler({ writeManifest }: YargsArgs): Promise<void>;
