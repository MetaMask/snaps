import type { Json } from '@metamask/utils';
import { ProgrammaticallyFixableSnapError } from '../snaps';
import type { SnapFiles } from '../types';
import { VirtualFile } from '../virtual-file';
import type { SnapManifest } from './validation';
/**
 * The result from the `checkManifest` function.
 *
 * @property manifest - The fixed manifest object.
 * @property updated - Whether the manifest was updated.
 * @property warnings - An array of warnings that were encountered during
 * processing of the manifest files. These warnings are not logged to the
 * console automatically, so depending on the environment the function is called
 * in, a different method for logging can be used.
 * @property errors - An array of errors that were encountered during
 * processing of the manifest files. These errors are not logged to the
 * console automatically, so depending on the environment the function is called
 * in, a different method for logging can be used.
 */
export declare type CheckManifestResult = {
    manifest: SnapManifest;
    updated?: boolean;
    warnings: string[];
    errors: string[];
};
export declare type WriteFileFunction = (path: string, data: string) => Promise<void>;
/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param writeManifest - Whether to write the fixed manifest to disk.
 * @param sourceCode - The source code of the Snap.
 * @param writeFileFn - The function to use to write the manifest to disk.
 * @returns Whether the manifest was updated, and an array of warnings that
 * were encountered during processing of the manifest files.
 */
export declare function checkManifest(basePath: string, writeManifest?: boolean, sourceCode?: string, writeFileFn?: WriteFileFunction): Promise<CheckManifestResult>;
/**
 * Given the relevant Snap files (manifest, `package.json`, and bundle) and a
 * Snap manifest validation error, fixes the fault in the manifest that caused
 * the error.
 *
 * @param snapFiles - The contents of all Snap files.
 * @param error - The {@link ProgrammaticallyFixableSnapError} that was thrown.
 * @returns A copy of the manifest file where the cause of the error is fixed.
 */
export declare function fixManifest(snapFiles: SnapFiles, error: ProgrammaticallyFixableSnapError): VirtualFile<SnapManifest>;
/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * bundle source file location and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @param sourceCode - Override source code for plugins.
 * @returns The contents of the bundle file, if any.
 */
export declare function getSnapSourceCode(basePath: string, manifest: Json, sourceCode?: string): Promise<VirtualFile | undefined>;
/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * icon and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @returns The contents of the icon, if any.
 */
export declare function getSnapIcon(basePath: string, manifest: Json): Promise<VirtualFile | undefined>;
/**
 * Sorts the given manifest in our preferred sort order and removes the
 * `repository` field if it is falsy (it may be `null`).
 *
 * @param manifest - The manifest to sort and modify.
 * @returns The disk-ready manifest.
 */
export declare function getWritableManifest(manifest: SnapManifest): SnapManifest;
/**
 * Validates the fields of an npm Snap manifest that has already passed JSON
 * Schema validation.
 *
 * @param snapFiles - The relevant snap files to validate.
 * @param snapFiles.manifest - The npm Snap manifest to validate.
 * @param snapFiles.packageJson - The npm Snap's `package.json`.
 * @param snapFiles.sourceCode - The Snap's source code.
 * @param snapFiles.svgIcon - The Snap's optional icon.
 */
export declare function validateNpmSnapManifest({ manifest, packageJson, sourceCode, svgIcon, }: SnapFiles): void;
