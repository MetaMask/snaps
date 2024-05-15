"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkE5WSD47Sjs = require('./chunk-E5WSD47S.js');




var _chunkHVTYDKBOjs = require('./chunk-HVTYDKBO.js');



var _chunkM3KAAQFKjs = require('./chunk-M3KAAQFK.js');



var _chunkCMOSYNZRjs = require('./chunk-CMOSYNZR.js');



var _chunkR5DO7T2Djs = require('./chunk-R5DO7T2D.js');


var _chunkG6BVXNNZjs = require('./chunk-G6BVXNNZ.js');


var _chunkQSCKTRRUjs = require('./chunk-QSCKTRRU.js');


var _chunkHJYRGKCXjs = require('./chunk-HJYRGKCX.js');


var _chunkNUCLSR2Gjs = require('./chunk-NUCLSR2G.js');

// src/manifest/manifest.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _utils = require('@metamask/utils');
var _fastdeepequal = require('fast-deep-equal'); var _fastdeepequal2 = _interopRequireDefault(_fastdeepequal);
var _fs = require('fs');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var MANIFEST_SORT_ORDER = {
  $schema: 1,
  version: 2,
  description: 3,
  proposedName: 4,
  repository: 5,
  source: 6,
  initialConnections: 7,
  initialPermissions: 8,
  manifestVersion: 9
};
async function checkManifest(basePath, writeManifest = true, sourceCode, writeFileFn = _fs.promises.writeFile) {
  const warnings = [];
  const errors = [];
  let updated = false;
  const manifestPath = _path2.default.join(basePath, "snap.manifest.json" /* Manifest */);
  const manifestFile = await _chunkG6BVXNNZjs.readJsonFile.call(void 0, manifestPath);
  const unvalidatedManifest = manifestFile.result;
  const packageFile = await _chunkG6BVXNNZjs.readJsonFile.call(void 0, 
    _path2.default.join(basePath, "package.json" /* PackageJson */)
  );
  const auxiliaryFilePaths = getSnapFilePaths(
    unvalidatedManifest,
    (manifest2) => manifest2?.source?.files
  );
  const localizationFilePaths = getSnapFilePaths(
    unvalidatedManifest,
    (manifest2) => manifest2?.source?.locales
  );
  const snapFiles = {
    manifest: manifestFile,
    packageJson: packageFile,
    sourceCode: await getSnapSourceCode(
      basePath,
      unvalidatedManifest,
      sourceCode
    ),
    svgIcon: await getSnapIcon(basePath, unvalidatedManifest),
    // Intentionally pass null as the encoding here since the files may be binary
    auxiliaryFiles: await getSnapFiles(basePath, auxiliaryFilePaths, null) ?? [],
    localizationFiles: await getSnapFiles(basePath, localizationFilePaths) ?? []
  };
  let manifest;
  try {
    ({ manifest } = await validateNpmSnap(snapFiles));
  } catch (error) {
    if (error instanceof _chunkHVTYDKBOjs.ProgrammaticallyFixableSnapError) {
      errors.push(error.message);
      const partiallyValidatedFiles = snapFiles;
      let isInvalid = true;
      let currentError = error;
      const maxAttempts = Object.keys(_chunkCMOSYNZRjs.SnapValidationFailureReason).length;
      for (let attempts = 1; isInvalid && attempts <= maxAttempts; attempts++) {
        manifest = await fixManifest(
          manifest ? { ...partiallyValidatedFiles, manifest } : partiallyValidatedFiles,
          currentError
        );
        try {
          await validateNpmSnapManifest({
            ...partiallyValidatedFiles,
            manifest
          });
          isInvalid = false;
        } catch (nextValidationError) {
          currentError = nextValidationError;
          if (!(nextValidationError instanceof _chunkHVTYDKBOjs.ProgrammaticallyFixableSnapError) || attempts === maxAttempts && !isInvalid) {
            throw new Error(
              `Internal error: Failed to fix manifest. This is a bug, please report it. Reason:
${error.message}`
            );
          }
          errors.push(currentError.message);
        }
      }
      updated = true;
    } else {
      throw error;
    }
  }
  _utils.assert.call(void 0, manifest);
  const validatedManifest = manifest.result;
  const recommendedFields = ["repository"];
  const missingRecommendedFields = recommendedFields.filter(
    (key) => !validatedManifest[key]
  );
  if (missingRecommendedFields.length > 0) {
    warnings.push(
      `Missing recommended package.json properties:
${missingRecommendedFields.reduce(
        (allMissing, currentField) => {
          return `${allMissing}	${currentField}
`;
        },
        ""
      )}`
    );
  }
  if (!snapFiles.svgIcon) {
    warnings.push(
      "No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information."
    );
  }
  const iconDimensions = snapFiles.svgIcon && _chunkM3KAAQFKjs.getSvgDimensions.call(void 0, snapFiles.svgIcon.toString());
  if (iconDimensions && iconDimensions.height !== iconDimensions.width) {
    warnings.push(
      "The icon in the Snap manifest is not square. It is recommended to use a square icon for the Snap."
    );
  }
  if (writeManifest) {
    try {
      const newManifest = `${JSON.stringify(
        getWritableManifest(validatedManifest),
        null,
        2
      )}
`;
      if (updated || newManifest !== manifestFile.value) {
        await writeFileFn(
          _path2.default.join(basePath, "snap.manifest.json" /* Manifest */),
          newManifest
        );
      }
    } catch (error) {
      throw new Error(`Failed to update snap.manifest.json: ${error.message}`);
    }
  }
  return { manifest: validatedManifest, updated, warnings, errors };
}
async function fixManifest(snapFiles, error) {
  const { manifest, packageJson } = snapFiles;
  const clonedFile = manifest.clone();
  const manifestCopy = clonedFile.result;
  switch (error.reason) {
    case '"name" field mismatch' /* NameMismatch */:
      manifestCopy.source.location.npm.packageName = packageJson.result.name;
      break;
    case '"version" field mismatch' /* VersionMismatch */:
      manifestCopy.version = packageJson.result.version;
      break;
    case '"repository" field mismatch' /* RepositoryMismatch */:
      manifestCopy.repository = packageJson.result.repository ? _chunkNUCLSR2Gjs.deepClone.call(void 0, packageJson.result.repository) : void 0;
      break;
    case '"shasum" field mismatch' /* ShasumMismatch */:
      manifestCopy.source.shasum = await _chunkHVTYDKBOjs.getSnapChecksum.call(void 0, snapFiles);
      break;
    default:
      _utils.assertExhaustive.call(void 0, error.reason);
  }
  clonedFile.result = manifestCopy;
  clonedFile.value = JSON.stringify(manifestCopy);
  return clonedFile;
}
async function getSnapSourceCode(basePath, manifest, sourceCode) {
  if (!_utils.isPlainObject.call(void 0, manifest)) {
    return void 0;
  }
  const sourceFilePath = manifest.source?.location?.npm?.filePath;
  if (!sourceFilePath) {
    return void 0;
  }
  if (sourceCode) {
    return new (0, _chunkHJYRGKCXjs.VirtualFile)({
      path: _path2.default.join(basePath, sourceFilePath),
      value: sourceCode
    });
  }
  try {
    const virtualFile = await _chunkQSCKTRRUjs.readVirtualFile.call(void 0, 
      _path2.default.join(basePath, sourceFilePath),
      "utf8"
    );
    return virtualFile;
  } catch (error) {
    throw new Error(
      `Failed to read snap bundle file: ${_snapssdk.getErrorMessage.call(void 0, error)}`
    );
  }
}
async function getSnapIcon(basePath, manifest) {
  if (!_utils.isPlainObject.call(void 0, manifest)) {
    return void 0;
  }
  const iconPath = manifest.source?.location?.npm?.iconPath;
  if (!iconPath) {
    return void 0;
  }
  try {
    const virtualFile = await _chunkQSCKTRRUjs.readVirtualFile.call(void 0, 
      _path2.default.join(basePath, iconPath),
      "utf8"
    );
    return virtualFile;
  } catch (error) {
    throw new Error(`Failed to read snap icon file: ${_snapssdk.getErrorMessage.call(void 0, error)}`);
  }
}
function getSnapFilePaths(manifest, selector) {
  if (!_utils.isPlainObject.call(void 0, manifest)) {
    return void 0;
  }
  const snapManifest = manifest;
  const paths = selector(snapManifest);
  if (!Array.isArray(paths)) {
    return void 0;
  }
  return paths;
}
async function getSnapFiles(basePath, paths, encoding = "utf8") {
  if (!paths) {
    return void 0;
  }
  try {
    return await Promise.all(
      paths.map(
        async (filePath) => _chunkQSCKTRRUjs.readVirtualFile.call(void 0, _path2.default.join(basePath, filePath), encoding)
      )
    );
  } catch (error) {
    throw new Error(`Failed to read snap files: ${_snapssdk.getErrorMessage.call(void 0, error)}`);
  }
}
function getWritableManifest(manifest) {
  const { repository, ...remaining } = manifest;
  const keys = Object.keys(
    repository ? { ...remaining, repository } : remaining
  );
  const writableManifest = keys.sort((a, b) => MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b]).reduce(
    (result, key) => ({
      ...result,
      [key]: manifest[key]
    }),
    {}
  );
  return writableManifest;
}
async function validateNpmSnapManifest({
  manifest,
  packageJson,
  sourceCode,
  svgIcon,
  auxiliaryFiles,
  localizationFiles
}) {
  const packageJsonName = packageJson.result.name;
  const packageJsonVersion = packageJson.result.version;
  const packageJsonRepository = packageJson.result.repository;
  const manifestPackageName = manifest.result.source.location.npm.packageName;
  const manifestPackageVersion = manifest.result.version;
  const manifestRepository = manifest.result.repository;
  if (packageJsonName !== manifestPackageName) {
    throw new (0, _chunkHVTYDKBOjs.ProgrammaticallyFixableSnapError)(
      `"${"snap.manifest.json" /* Manifest */}" npm package name ("${manifestPackageName}") does not match the "${"package.json" /* PackageJson */}" "name" field ("${packageJsonName}").`,
      '"name" field mismatch' /* NameMismatch */
    );
  }
  if (packageJsonVersion !== manifestPackageVersion) {
    throw new (0, _chunkHVTYDKBOjs.ProgrammaticallyFixableSnapError)(
      `"${"snap.manifest.json" /* Manifest */}" npm package version ("${manifestPackageVersion}") does not match the "${"package.json" /* PackageJson */}" "version" field ("${packageJsonVersion}").`,
      '"version" field mismatch' /* VersionMismatch */
    );
  }
  if (
    // The repository may be `undefined` in package.json but can only be defined
    // or `null` in the Snap manifest due to TS@<4.4 issues.
    (packageJsonRepository || manifestRepository) && !_fastdeepequal2.default.call(void 0, packageJsonRepository, manifestRepository)
  ) {
    throw new (0, _chunkHVTYDKBOjs.ProgrammaticallyFixableSnapError)(
      `"${"snap.manifest.json" /* Manifest */}" "repository" field does not match the "${"package.json" /* PackageJson */}" "repository" field.`,
      '"repository" field mismatch' /* RepositoryMismatch */
    );
  }
  await _chunkHVTYDKBOjs.validateSnapShasum.call(void 0, 
    { manifest, sourceCode, svgIcon, auxiliaryFiles, localizationFiles },
    `"${"snap.manifest.json" /* Manifest */}" "shasum" field does not match computed shasum.`
  );
}

// src/npm.ts
var EXPECTED_SNAP_FILES = [
  "manifest",
  "packageJson",
  "sourceCode"
];
var SnapFileNameFromKey = {
  manifest: "snap.manifest.json" /* Manifest */,
  packageJson: "package.json" /* PackageJson */,
  sourceCode: "source code bundle"
};
async function validateNpmSnap(snapFiles, errorPrefix) {
  EXPECTED_SNAP_FILES.forEach((key) => {
    if (!snapFiles[key]) {
      throw new Error(
        `${errorPrefix ?? ""}Missing file "${SnapFileNameFromKey[key]}".`
      );
    }
  });
  const {
    manifest,
    packageJson,
    sourceCode,
    svgIcon,
    auxiliaryFiles,
    localizationFiles
  } = snapFiles;
  try {
    _chunkE5WSD47Sjs.assertIsSnapManifest.call(void 0, manifest.result);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ""}${error.message}`);
  }
  const validatedManifest = manifest;
  const { iconPath } = validatedManifest.result.source.location.npm;
  if (iconPath && !svgIcon) {
    throw new Error(`Missing file "${iconPath}".`);
  }
  try {
    _chunkCMOSYNZRjs.assertIsNpmSnapPackageJson.call(void 0, packageJson.result);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ""}${error.message}`);
  }
  const validatedPackageJson = packageJson;
  await validateNpmSnapManifest({
    manifest: validatedManifest,
    packageJson: validatedPackageJson,
    sourceCode,
    svgIcon,
    auxiliaryFiles,
    localizationFiles
  });
  if (svgIcon) {
    try {
      _chunkM3KAAQFKjs.assertIsSnapIcon.call(void 0, svgIcon);
    } catch (error) {
      throw new Error(`${errorPrefix ?? ""}${error.message}`);
    }
  }
  if (localizationFiles) {
    try {
      _chunkR5DO7T2Djs.getValidatedLocalizationFiles.call(void 0, localizationFiles);
      _chunkR5DO7T2Djs.validateSnapManifestLocalizations.call(void 0, 
        manifest.result,
        localizationFiles.map((file) => file.result)
      );
    } catch (error) {
      throw new Error(`${errorPrefix ?? ""}${error.message}`);
    }
  }
  return {
    manifest: validatedManifest,
    packageJson: validatedPackageJson,
    sourceCode,
    svgIcon,
    auxiliaryFiles,
    localizationFiles
  };
}













exports.EXPECTED_SNAP_FILES = EXPECTED_SNAP_FILES; exports.SnapFileNameFromKey = SnapFileNameFromKey; exports.validateNpmSnap = validateNpmSnap; exports.checkManifest = checkManifest; exports.fixManifest = fixManifest; exports.getSnapSourceCode = getSnapSourceCode; exports.getSnapIcon = getSnapIcon; exports.getSnapFilePaths = getSnapFilePaths; exports.getSnapFiles = getSnapFiles; exports.getWritableManifest = getWritableManifest; exports.validateNpmSnapManifest = validateNpmSnapManifest;
//# sourceMappingURL=chunk-D7Z3SN2N.js.map