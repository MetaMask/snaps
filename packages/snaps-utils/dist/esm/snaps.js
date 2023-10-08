function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import { assert, isObject, assertStruct } from '@metamask/utils';
import { base64 } from '@scure/base';
import stableStringify from 'fast-json-stable-stringify';
import { empty, enums, intersection, literal, pattern, refine, string, union, validate } from 'superstruct';
import validateNPMPackage from 'validate-npm-package-name';
import { SnapCaveatType } from './caveats';
import { checksumFiles } from './checksum';
import { SnapIdPrefixes, SnapValidationFailureReason, uri } from './types';
// This RegEx matches valid npm package names (with some exceptions) and space-
// separated alphanumerical words, optionally with dashes and underscores.
// The RegEx consists of two parts. The first part matches space-separated
// words. It is based on the following Stackoverflow answer:
// https://stackoverflow.com/a/34974982
// The second part, after the pipe operator, is the same RegEx used for the
// `name` field of the official package.json JSON Schema, except that we allow
// mixed-case letters. It was originally copied from:
// https://github.com/SchemaStore/schemastore/blob/81a16897c1dabfd98c72242a5fd62eb080ff76d8/src/schemas/json/package.json#L132-L138
export const PROPOSED_NAME_REGEX = /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u;
export var SnapStatus;
(function(SnapStatus) {
    SnapStatus["Installing"] = 'installing';
    SnapStatus["Updating"] = 'updating';
    SnapStatus["Running"] = 'running';
    SnapStatus["Stopped"] = 'stopped';
    SnapStatus["Crashed"] = 'crashed';
})(SnapStatus || (SnapStatus = {}));
export var SnapStatusEvents;
(function(SnapStatusEvents) {
    SnapStatusEvents["Start"] = 'START';
    SnapStatusEvents["Stop"] = 'STOP';
    SnapStatusEvents["Crash"] = 'CRASH';
    SnapStatusEvents["Update"] = 'UPDATE';
})(SnapStatusEvents || (SnapStatusEvents = {}));
/**
 * An error indicating that a Snap validation failure is programmatically
 * fixable during development.
 */ export class ProgrammaticallyFixableSnapError extends Error {
    constructor(message, reason){
        super(message);
        _define_property(this, "reason", void 0);
        this.reason = reason;
    }
}
/**
 * Gets a checksummable manifest by removing the shasum property and reserializing the JSON using a deterministic algorithm.
 *
 * @param manifest - The manifest itself.
 * @returns A virtual file containing the checksummable manifest.
 */ function getChecksummableManifest(manifest) {
    const manifestCopy = manifest.clone();
    delete manifestCopy.result.source.shasum;
    // We use fast-json-stable-stringify to deterministically serialize the JSON
    // This is required before checksumming so we get reproducible checksums across platforms etc
    manifestCopy.value = stableStringify(manifestCopy.result);
    return manifestCopy;
}
/**
 * Calculates the Base64-encoded SHA-256 digest of all required Snap files.
 *
 * @param files - All required Snap files to be included in the checksum.
 * @returns The Base64-encoded SHA-256 digest of the source code.
 */ export function getSnapChecksum(files) {
    const { manifest, sourceCode, svgIcon } = files;
    const all = [
        getChecksummableManifest(manifest),
        sourceCode,
        svgIcon
    ].filter((file)=>file !== undefined);
    return base64.encode(checksumFiles(all));
}
/**
 * Checks whether the `source.shasum` property of a Snap manifest matches the
 * shasum of the snap.
 *
 * @param files - All required Snap files to be included in the checksum.
 * @param errorMessage - The error message to throw if validation fails.
 */ export function validateSnapShasum(files, errorMessage = 'Invalid Snap manifest: manifest shasum does not match computed shasum.') {
    if (files.manifest.result.source.shasum !== getSnapChecksum(files)) {
        throw new ProgrammaticallyFixableSnapError(errorMessage, SnapValidationFailureReason.ShasumMismatch);
    }
}
export const LOCALHOST_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '[::1]'
];
// Require snap ids to only consist of printable ASCII characters
export const BaseSnapIdStruct = pattern(string(), /^[\x21-\x7E]*$/u);
const LocalSnapIdSubUrlStruct = uri({
    protocol: enums([
        'http:',
        'https:'
    ]),
    hostname: enums(LOCALHOST_HOSTNAMES),
    hash: empty(string()),
    search: empty(string())
});
export const LocalSnapIdStruct = refine(BaseSnapIdStruct, 'local Snap Id', (value)=>{
    if (!value.startsWith(SnapIdPrefixes.local)) {
        return `Expected local snap ID, got "${value}".`;
    }
    const [error] = validate(value.slice(SnapIdPrefixes.local.length), LocalSnapIdSubUrlStruct);
    return error ?? true;
});
export const NpmSnapIdStruct = intersection([
    BaseSnapIdStruct,
    uri({
        protocol: literal(SnapIdPrefixes.npm),
        pathname: refine(string(), 'package name', function*(value) {
            const normalized = value.startsWith('/') ? value.slice(1) : value;
            const { errors, validForNewPackages, warnings } = validateNPMPackage(normalized);
            if (!validForNewPackages) {
                if (errors === undefined) {
                    assert(warnings !== undefined);
                    yield* warnings;
                } else {
                    yield* errors;
                }
            }
            return true;
        }),
        search: empty(string()),
        hash: empty(string())
    })
]);
export const HttpSnapIdStruct = intersection([
    BaseSnapIdStruct,
    uri({
        protocol: enums([
            'http:',
            'https:'
        ]),
        search: empty(string()),
        hash: empty(string())
    })
]);
export const SnapIdStruct = union([
    NpmSnapIdStruct,
    LocalSnapIdStruct
]);
/**
 * Extracts the snap prefix from a snap ID.
 *
 * @param snapId - The snap ID to extract the prefix from.
 * @returns The snap prefix from a snap id, e.g. `npm:`.
 */ export function getSnapPrefix(snapId) {
    const prefix = Object.values(SnapIdPrefixes).find((possiblePrefix)=>snapId.startsWith(possiblePrefix));
    if (prefix !== undefined) {
        return prefix;
    }
    throw new Error(`Invalid or no prefix found for "${snapId}"`);
}
/**
 * Strips snap prefix from a full snap ID.
 *
 * @param snapId - The snap ID to strip.
 * @returns The stripped snap ID.
 */ export function stripSnapPrefix(snapId) {
    return snapId.replace(getSnapPrefix(snapId), '');
}
/**
 * Assert that the given value is a valid snap ID.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid snap ID.
 */ export function assertIsValidSnapId(value) {
    assertStruct(value, SnapIdStruct, 'Invalid snap ID');
}
/**
 * Typeguard to ensure a chainId follows the CAIP-2 standard.
 *
 * @param chainId - The chainId being tested.
 * @returns `true` if the value is a valid CAIP chain id, and `false` otherwise.
 */ export function isCaipChainId(chainId) {
    return typeof chainId === 'string' && RegExp("^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$", "u").test(chainId);
}
/**
 * Utility function to check if an origin has permission (and caveat) for a particular snap.
 *
 * @param permissions - An origin's permissions object.
 * @param snapId - The id of the snap.
 * @returns A boolean based on if an origin has the specified snap.
 */ export function isSnapPermitted(permissions, snapId) {
    return Boolean((permissions?.wallet_snap?.caveats?.find((caveat)=>caveat.type === SnapCaveatType.SnapIds) ?? {}).value?.[snapId]);
}
/**
 * Checks whether the passed in requestedPermissions is a valid
 * permission request for a `wallet_snap` permission.
 *
 * @param requestedPermissions - The requested permissions.
 * @throws If the criteria is not met.
 */ export function verifyRequestedSnapPermissions(requestedPermissions) {
    assert(isObject(requestedPermissions), 'Requested permissions must be an object.');
    const { wallet_snap: walletSnapPermission } = requestedPermissions;
    assert(isObject(walletSnapPermission), 'wallet_snap is missing from the requested permissions.');
    const { caveats } = walletSnapPermission;
    assert(Array.isArray(caveats) && caveats.length === 1, 'wallet_snap must have a caveat property with a single-item array value.');
    const [caveat] = caveats;
    assert(isObject(caveat) && caveat.type === SnapCaveatType.SnapIds && isObject(caveat.value), `The requested permissions do not have a valid ${SnapCaveatType.SnapIds} caveat.`);
}

//# sourceMappingURL=snaps.js.map