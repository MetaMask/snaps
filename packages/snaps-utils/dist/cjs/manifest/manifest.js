"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    checkManifest: function() {
        return checkManifest;
    },
    fixManifest: function() {
        return fixManifest;
    },
    getSnapSourceCode: function() {
        return getSnapSourceCode;
    },
    getSnapIcon: function() {
        return getSnapIcon;
    },
    getWritableManifest: function() {
        return getWritableManifest;
    },
    validateNpmSnapManifest: function() {
        return validateNpmSnapManifest;
    }
});
const _utils = require("@metamask/utils");
const _fastdeepequal = /*#__PURE__*/ _interop_require_default(require("fast-deep-equal"));
const _fs = require("fs");
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _deepclone = require("../deep-clone");
const _fs1 = require("../fs");
const _npm = require("../npm");
const _snaps = require("../snaps");
const _types = require("../types");
const _virtualfile = require("../virtual-file");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const MANIFEST_SORT_ORDER = {
    $schema: 1,
    version: 2,
    description: 3,
    proposedName: 4,
    repository: 5,
    source: 6,
    initialPermissions: 7,
    manifestVersion: 8
};
async function checkManifest(basePath, writeManifest = true, sourceCode, writeFileFn = _fs.promises.writeFile) {
    const warnings = [];
    const errors = [];
    let updated = false;
    const manifestPath = _path.default.join(basePath, _types.NpmSnapFileNames.Manifest);
    const manifestFile = await (0, _fs1.readJsonFile)(manifestPath);
    const unvalidatedManifest = manifestFile.result;
    const packageFile = await (0, _fs1.readJsonFile)(_path.default.join(basePath, _types.NpmSnapFileNames.PackageJson));
    const snapFiles = {
        manifest: manifestFile,
        packageJson: packageFile,
        sourceCode: await getSnapSourceCode(basePath, unvalidatedManifest, sourceCode),
        svgIcon: await getSnapIcon(basePath, unvalidatedManifest)
    };
    let manifest;
    try {
        ({ manifest } = (0, _npm.validateNpmSnap)(snapFiles));
    } catch (error) {
        if (error instanceof _snaps.ProgrammaticallyFixableSnapError) {
            errors.push(error.message);
            // If we get here, the files at least have the correct shape.
            const partiallyValidatedFiles = snapFiles;
            let isInvalid = true;
            let currentError = error;
            const maxAttempts = Object.keys(_types.SnapValidationFailureReason).length;
            // Attempt to fix all fixable validation failure reasons. All such reasons
            // are enumerated by the `SnapValidationFailureReason` enum, so we only
            // attempt to fix the manifest the same amount of times as there are
            // reasons in the enum.
            for(let attempts = 1; isInvalid && attempts <= maxAttempts; attempts++){
                manifest = fixManifest(manifest ? {
                    ...partiallyValidatedFiles,
                    manifest
                } : partiallyValidatedFiles, currentError);
                try {
                    validateNpmSnapManifest({
                        ...partiallyValidatedFiles,
                        manifest
                    });
                    isInvalid = false;
                } catch (nextValidationError) {
                    currentError = nextValidationError;
                    /* istanbul ignore next: this should be impossible */ if (!(nextValidationError instanceof _snaps.ProgrammaticallyFixableSnapError) || attempts === maxAttempts && !isInvalid) {
                        throw new Error(`Internal error: Failed to fix manifest. This is a bug, please report it. Reason:\n${error.message}`);
                    }
                    errors.push(currentError.message);
                }
            }
            updated = true;
        } else {
            throw error;
        }
    }
    // TypeScript assumes `manifest` can still be undefined, that is not the case.
    // But we assert to keep TypeScript happy.
    (0, _utils.assert)(manifest);
    const validatedManifest = manifest.result;
    // Check presence of recommended keys
    const recommendedFields = [
        'repository'
    ];
    const missingRecommendedFields = recommendedFields.filter((key)=>!validatedManifest[key]);
    if (missingRecommendedFields.length > 0) {
        warnings.push(`Missing recommended package.json properties:\n${missingRecommendedFields.reduce((allMissing, currentField)=>{
            return `${allMissing}\t${currentField}\n`;
        }, '')}`);
    }
    if (writeManifest) {
        try {
            const newManifest = `${JSON.stringify(getWritableManifest(validatedManifest), null, 2)}\n`;
            if (updated || newManifest !== manifestFile.value) {
                await writeFileFn(_path.default.join(basePath, _types.NpmSnapFileNames.Manifest), newManifest);
            }
        } catch (error) {
            // Note: This error isn't pushed to the errors array, because it's not an
            // error in the manifest itself.
            throw new Error(`Failed to update snap.manifest.json: ${error.message}`);
        }
    }
    return {
        manifest: validatedManifest,
        updated,
        warnings,
        errors
    };
}
function fixManifest(snapFiles, error) {
    const { manifest, packageJson } = snapFiles;
    const clonedFile = manifest.clone();
    const manifestCopy = clonedFile.result;
    switch(error.reason){
        case _types.SnapValidationFailureReason.NameMismatch:
            manifestCopy.source.location.npm.packageName = packageJson.result.name;
            break;
        case _types.SnapValidationFailureReason.VersionMismatch:
            manifestCopy.version = packageJson.result.version;
            break;
        case _types.SnapValidationFailureReason.RepositoryMismatch:
            manifestCopy.repository = packageJson.result.repository ? (0, _deepclone.deepClone)(packageJson.result.repository) : undefined;
            break;
        case _types.SnapValidationFailureReason.ShasumMismatch:
            manifestCopy.source.shasum = (0, _snaps.getSnapChecksum)(snapFiles);
            break;
        /* istanbul ignore next */ default:
            (0, _utils.assertExhaustive)(error.reason);
    }
    clonedFile.result = manifestCopy;
    clonedFile.value = JSON.stringify(manifestCopy);
    return clonedFile;
}
async function getSnapSourceCode(basePath, manifest, sourceCode) {
    if (!(0, _utils.isPlainObject)(manifest)) {
        return undefined;
    }
    const sourceFilePath = manifest.source?.location?.npm?.filePath;
    if (!sourceFilePath) {
        return undefined;
    }
    if (sourceCode) {
        return new _virtualfile.VirtualFile({
            path: _path.default.join(basePath, sourceFilePath),
            value: sourceCode
        });
    }
    try {
        const virtualFile = await (0, _virtualfile.readVirtualFile)(_path.default.join(basePath, sourceFilePath), 'utf8');
        return virtualFile;
    } catch (error) {
        throw new Error(`Failed to read snap bundle file: ${error.message}`);
    }
}
async function getSnapIcon(basePath, manifest) {
    if (!(0, _utils.isPlainObject)(manifest)) {
        return undefined;
    }
    const iconPath = manifest.source?.location?.npm?.iconPath;
    if (!iconPath) {
        return undefined;
    }
    try {
        const virtualFile = await (0, _virtualfile.readVirtualFile)(_path.default.join(basePath, iconPath), 'utf8');
        return virtualFile;
    } catch (error) {
        throw new Error(`Failed to read snap icon file: ${error.message}`);
    }
}
function getWritableManifest(manifest) {
    const { repository, ...remaining } = manifest;
    const keys = Object.keys(repository ? {
        ...remaining,
        repository
    } : remaining);
    const writableManifest = keys.sort((a, b)=>MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b]).reduce((result, key)=>({
            ...result,
            [key]: manifest[key]
        }), {});
    return writableManifest;
}
function validateNpmSnapManifest({ manifest, packageJson, sourceCode, svgIcon }) {
    const packageJsonName = packageJson.result.name;
    const packageJsonVersion = packageJson.result.version;
    const packageJsonRepository = packageJson.result.repository;
    const manifestPackageName = manifest.result.source.location.npm.packageName;
    const manifestPackageVersion = manifest.result.version;
    const manifestRepository = manifest.result.repository;
    if (packageJsonName !== manifestPackageName) {
        throw new _snaps.ProgrammaticallyFixableSnapError(`"${_types.NpmSnapFileNames.Manifest}" npm package name ("${manifestPackageName}") does not match the "${_types.NpmSnapFileNames.PackageJson}" "name" field ("${packageJsonName}").`, _types.SnapValidationFailureReason.NameMismatch);
    }
    if (packageJsonVersion !== manifestPackageVersion) {
        throw new _snaps.ProgrammaticallyFixableSnapError(`"${_types.NpmSnapFileNames.Manifest}" npm package version ("${manifestPackageVersion}") does not match the "${_types.NpmSnapFileNames.PackageJson}" "version" field ("${packageJsonVersion}").`, _types.SnapValidationFailureReason.VersionMismatch);
    }
    if (// The repository may be `undefined` in package.json but can only be defined
    // or `null` in the Snap manifest due to TS@<4.4 issues.
    (packageJsonRepository || manifestRepository) && !(0, _fastdeepequal.default)(packageJsonRepository, manifestRepository)) {
        throw new _snaps.ProgrammaticallyFixableSnapError(`"${_types.NpmSnapFileNames.Manifest}" "repository" field does not match the "${_types.NpmSnapFileNames.PackageJson}" "repository" field.`, _types.SnapValidationFailureReason.RepositoryMismatch);
    }
    (0, _snaps.validateSnapShasum)({
        manifest,
        sourceCode,
        svgIcon
    }, `"${_types.NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum.`);
}

//# sourceMappingURL=manifest.js.map