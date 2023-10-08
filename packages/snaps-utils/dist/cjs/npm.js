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
    EXPECTED_SNAP_FILES: function() {
        return EXPECTED_SNAP_FILES;
    },
    SnapFileNameFromKey: function() {
        return SnapFileNameFromKey;
    },
    validateNpmSnap: function() {
        return validateNpmSnap;
    }
});
const _icon = require("./icon");
const _manifest = require("./manifest/manifest");
const _validation = require("./manifest/validation");
const _types = require("./types");
const EXPECTED_SNAP_FILES = [
    'manifest',
    'packageJson',
    'sourceCode'
];
const SnapFileNameFromKey = {
    manifest: _types.NpmSnapFileNames.Manifest,
    packageJson: _types.NpmSnapFileNames.PackageJson,
    sourceCode: 'source code bundle'
};
function validateNpmSnap(snapFiles, errorPrefix) {
    EXPECTED_SNAP_FILES.forEach((key)=>{
        if (!snapFiles[key]) {
            throw new Error(`${errorPrefix ?? ''}Missing file "${SnapFileNameFromKey[key]}".`);
        }
    });
    // Typecast: We are assured that the required files exist if we get here.
    const { manifest, packageJson, sourceCode, svgIcon } = snapFiles;
    try {
        (0, _validation.assertIsSnapManifest)(manifest.result);
    } catch (error) {
        throw new Error(`${errorPrefix ?? ''}${error.message}`);
    }
    const validatedManifest = manifest;
    const { iconPath } = validatedManifest.result.source.location.npm;
    if (iconPath && !svgIcon) {
        throw new Error(`Missing file "${iconPath}".`);
    }
    try {
        (0, _types.assertIsNpmSnapPackageJson)(packageJson.result);
    } catch (error) {
        throw new Error(`${errorPrefix ?? ''}${error.message}`);
    }
    const validatedPackageJson = packageJson;
    (0, _manifest.validateNpmSnapManifest)({
        manifest: validatedManifest,
        packageJson: validatedPackageJson,
        sourceCode,
        svgIcon
    });
    if (svgIcon) {
        try {
            (0, _icon.assertIsSnapIcon)(svgIcon);
        } catch (error) {
            throw new Error(`${errorPrefix ?? ''}${error.message}`);
        }
    }
    return {
        manifest: validatedManifest,
        packageJson: validatedPackageJson,
        sourceCode,
        svgIcon
    };
}

//# sourceMappingURL=npm.js.map