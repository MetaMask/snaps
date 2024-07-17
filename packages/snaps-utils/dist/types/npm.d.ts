import type { SnapFiles, UnvalidatedSnapFiles } from './types';
import { NpmSnapFileNames } from './types';
export declare const EXPECTED_SNAP_FILES: readonly ["manifest", "packageJson", "sourceCode"];
export declare const SnapFileNameFromKey: {
    readonly manifest: NpmSnapFileNames.Manifest;
    readonly packageJson: NpmSnapFileNames.PackageJson;
    readonly sourceCode: "source code bundle";
};
/**
 * Validates the files extracted from an npm Snap package tarball by ensuring
 * that they're non-empty and that the Json files match their respective schemas
 * and the Snaps publishing specification.
 *
 * @param snapFiles - The object containing the expected Snap file contents,
 * if any.
 * @param errorPrefix - The prefix of the error message.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export declare function validateNpmSnap(snapFiles: UnvalidatedSnapFiles, errorPrefix?: `${string}: `): Promise<SnapFiles>;
