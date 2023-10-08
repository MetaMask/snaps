import { assertStruct, VersionStruct } from '@metamask/utils';
import { instance, is, object, optional, pattern, refine, size, string, type, union, assert as assertSuperstruct } from 'superstruct';
import { HandlerType } from './handlers';
export var NpmSnapFileNames;
(function(NpmSnapFileNames) {
    NpmSnapFileNames["PackageJson"] = 'package.json';
    NpmSnapFileNames["Manifest"] = 'snap.manifest.json';
})(NpmSnapFileNames || (NpmSnapFileNames = {}));
export const NameStruct = size(pattern(string(), /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u), 1, 214);
// Note we use `type` instead of `object` here, because the latter does not
// allow unknown keys.
export const NpmSnapPackageJsonStruct = type({
    version: VersionStruct,
    name: NameStruct,
    main: optional(size(string(), 1, Infinity)),
    repository: optional(object({
        type: size(string(), 1, Infinity),
        url: size(string(), 1, Infinity)
    }))
});
/**
 * Check if the given value is a valid {@link NpmSnapPackageJson} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link NpmSnapPackageJson} object.
 */ export function isNpmSnapPackageJson(value) {
    return is(value, NpmSnapPackageJsonStruct);
}
/**
 * Asserts that the given value is a valid {@link NpmSnapPackageJson} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link NpmSnapPackageJson} object.
 */ export function assertIsNpmSnapPackageJson(value) {
    assertStruct(value, NpmSnapPackageJsonStruct, `"${NpmSnapFileNames.PackageJson}" is invalid`);
}
export var SnapIdPrefixes;
(function(SnapIdPrefixes) {
    SnapIdPrefixes["npm"] = 'npm:';
    SnapIdPrefixes["local"] = 'local:';
})(SnapIdPrefixes || (SnapIdPrefixes = {}));
export var SnapValidationFailureReason;
(function(SnapValidationFailureReason) {
    SnapValidationFailureReason["NameMismatch"] = '"name" field mismatch';
    SnapValidationFailureReason["VersionMismatch"] = '"version" field mismatch';
    SnapValidationFailureReason["RepositoryMismatch"] = '"repository" field mismatch';
    SnapValidationFailureReason["ShasumMismatch"] = '"shasum" field mismatch';
})(SnapValidationFailureReason || (SnapValidationFailureReason = {}));
export var SNAP_STREAM_NAMES;
(function(SNAP_STREAM_NAMES) {
    SNAP_STREAM_NAMES["JSON_RPC"] = 'jsonRpc';
    SNAP_STREAM_NAMES["COMMAND"] = 'command';
})(SNAP_STREAM_NAMES || (SNAP_STREAM_NAMES = {}));
/* eslint-enable @typescript-eslint/naming-convention */ export const SNAP_EXPORT_NAMES = Object.values(HandlerType);
export const uri = (opts = {})=>refine(union([
        string(),
        instance(URL)
    ]), 'uri', (value)=>{
        try {
            const url = new URL(value);
            const UrlStruct = type(opts);
            assertSuperstruct(url, UrlStruct);
            return true;
        } catch  {
            return `Expected URL, got "${value.toString()}".`;
        }
    });
/**
 * Returns whether a given value is a valid URL.
 *
 * @param url - The value to check.
 * @param opts - Optional constraints for url checking.
 * @returns Whether `url` is valid URL or not.
 */ export function isValidUrl(url, opts = {}) {
    return is(url, uri(opts));
}
// redefining here to avoid circular dependency
export const WALLET_SNAP_PERMISSION_KEY = 'wallet_snap';

//# sourceMappingURL=types.js.map