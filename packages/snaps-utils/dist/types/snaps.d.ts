import type { SubjectPermissions, PermissionConstraint } from '@metamask/permission-controller';
import type { BlockReason } from '@metamask/snaps-registry';
import type { SnapId, Snap as TruncatedSnap } from '@metamask/snaps-sdk';
import type { Struct } from 'superstruct';
import type { LocalizationFile } from './localization';
import type { InitialConnections, SnapManifest, SnapPermissions } from './manifest/validation';
import type { FetchedSnapFiles, SnapsPermissionRequest } from './types';
import { SnapIdPrefixes, SnapValidationFailureReason } from './types';
export declare const PROPOSED_NAME_REGEX: RegExp;
export declare enum SnapStatus {
    Installing = "installing",
    Updating = "updating",
    Running = "running",
    Stopped = "stopped",
    Crashed = "crashed"
}
export declare enum SnapStatusEvents {
    Start = "START",
    Stop = "STOP",
    Crash = "CRASH",
    Update = "UPDATE"
}
export declare type StatusContext = {
    snapId: SnapId;
};
export declare type StatusEvents = {
    type: SnapStatusEvents;
};
export declare type StatusStates = {
    value: SnapStatus;
    context: StatusContext;
};
export declare type Status = StatusStates['value'];
export declare type VersionHistory = {
    origin: string;
    version: string;
    date: number;
};
export declare type SnapAuxilaryFile = {
    path: string;
    value: string;
};
export declare type PersistedSnap = Snap;
/**
 * A Snap as it exists in {@link SnapController} state.
 */
export declare type Snap = TruncatedSnap & {
    /**
     * The initial connections of the Snap, optional, requested on installation.
     */
    initialConnections?: InitialConnections;
    /**
     * The initial permissions of the Snap, which will be requested when it is
     * installed.
     */
    initialPermissions: SnapPermissions;
    /**
     * The source code of the Snap.
     */
    sourceCode: string;
    /**
     * The Snap's manifest file.
     */
    manifest: SnapManifest;
    /**
     * Information detailing why the snap is blocked.
     */
    blockInformation?: BlockReason;
    /**
     * The current status of the Snap, e.g. whether it's running or stopped.
     */
    status: Status;
    /**
     * The version history of the Snap.
     * Can be used to derive when the Snap was installed, when it was updated to a certain version and who requested the change.
     */
    versionHistory: VersionHistory[];
    /**
     * Static auxiliary files that can be loaded at runtime.
     */
    auxiliaryFiles?: SnapAuxilaryFile[];
    /**
     * Localization files which are used to translate the manifest.
     */
    localizationFiles?: LocalizationFile[];
    /**
     * Flag to signal whether this snap was preinstalled or not.
     *
     * A lack of specifying this option will be deemed as not preinstalled.
     */
    preinstalled?: boolean;
    /**
     * Flag to signal whether this snap is removable or not.
     *
     * A lack of specifying this option will be deemed as removable.
     */
    removable?: boolean;
};
export declare type TruncatedSnapFields = 'id' | 'initialPermissions' | 'version' | 'enabled' | 'blocked';
/**
 * An error indicating that a Snap validation failure is programmatically
 * fixable during development.
 */
export declare class ProgrammaticallyFixableSnapError extends Error {
    reason: SnapValidationFailureReason;
    constructor(message: string, reason: SnapValidationFailureReason);
}
/**
 * Calculates the Base64-encoded SHA-256 digest of all required Snap files.
 *
 * @param files - All required Snap files to be included in the checksum.
 * @returns The Base64-encoded SHA-256 digest of the source code.
 */
export declare function getSnapChecksum(files: FetchedSnapFiles): Promise<string>;
/**
 * Checks whether the `source.shasum` property of a Snap manifest matches the
 * shasum of the snap.
 *
 * @param files - All required Snap files to be included in the checksum.
 * @param errorMessage - The error message to throw if validation fails.
 */
export declare function validateSnapShasum(files: FetchedSnapFiles, errorMessage?: string): Promise<void>;
export declare const LOCALHOST_HOSTNAMES: readonly ["localhost", "127.0.0.1", "[::1]"];
export declare const BaseSnapIdStruct: Struct<string, null>;
export declare const LocalSnapIdStruct: Struct<string, null>;
export declare const NpmSnapIdStruct: Struct<string, null>;
export declare const HttpSnapIdStruct: Struct<string, null>;
export declare const SnapIdStruct: Struct<string, null>;
/**
 * Extracts the snap prefix from a snap ID.
 *
 * @param snapId - The snap ID to extract the prefix from.
 * @returns The snap prefix from a snap id, e.g. `npm:`.
 */
export declare function getSnapPrefix(snapId: string): SnapIdPrefixes;
/**
 * Strips snap prefix from a full snap ID.
 *
 * @param snapId - The snap ID to strip.
 * @returns The stripped snap ID.
 */
export declare function stripSnapPrefix(snapId: string): string;
/**
 * Assert that the given value is a valid snap ID.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid snap ID.
 */
export declare function assertIsValidSnapId(value: unknown): asserts value is SnapId;
/**
 * Typeguard to ensure a chainId follows the CAIP-2 standard.
 *
 * @param chainId - The chainId being tested.
 * @returns `true` if the value is a valid CAIP chain id, and `false` otherwise.
 */
export declare function isCaipChainId(chainId: unknown): chainId is string;
/**
 * Utility function to check if an origin has permission (and caveat) for a particular snap.
 *
 * @param permissions - An origin's permissions object.
 * @param snapId - The id of the snap.
 * @returns A boolean based on if an origin has the specified snap.
 */
export declare function isSnapPermitted(permissions: SubjectPermissions<PermissionConstraint>, snapId: SnapId): boolean;
/**
 * Checks whether the passed in requestedPermissions is a valid
 * permission request for a `wallet_snap` permission.
 *
 * @param requestedPermissions - The requested permissions.
 * @throws If the criteria is not met.
 */
export declare function verifyRequestedSnapPermissions(requestedPermissions: unknown): asserts requestedPermissions is SnapsPermissionRequest;
export type { Snap as TruncatedSnap } from '@metamask/snaps-sdk';
