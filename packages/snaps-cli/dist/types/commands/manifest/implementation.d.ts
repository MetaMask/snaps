import type { Ora } from 'ora';
/**
 * Check the snap manifest file at the given path. If `write` is `true`, the
 * manifest will be written to disk if it is invalid. If `write` is `false`,
 * the manifest will not be written to disk, and the function will log any
 * errors and warnings to the console.
 *
 * @param path - The path to the manifest file.
 * @param write - Whether to write the manifest to disk if it is invalid.
 * @param spinner - An optional spinner to use for logging.
 */
export declare function manifest(path: string, write: boolean, spinner?: Ora): Promise<boolean>;
