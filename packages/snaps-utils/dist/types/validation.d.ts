import type { FetchedSnapFiles } from './types';
/**
 * Validates the files contained in a fetched snap.
 *
 * @param files - All potentially included files in a fetched snap.
 * @throws If any of the files are considered invalid.
 */
export declare function validateFetchedSnap(files: FetchedSnapFiles): Promise<void>;
