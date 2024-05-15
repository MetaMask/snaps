import {
  assertIsSnapManifest
} from "./chunk-HTS6HGUU.mjs";
import {
  ProgrammaticallyFixableSnapError,
  getSnapChecksum,
  validateSnapShasum
} from "./chunk-2M6G46W6.mjs";
import {
  assertIsSnapIcon,
  getSvgDimensions
} from "./chunk-MNCFAD4E.mjs";
import {
  SnapValidationFailureReason,
  assertIsNpmSnapPackageJson
} from "./chunk-T6FWIDA6.mjs";
import {
  getValidatedLocalizationFiles,
  validateSnapManifestLocalizations
} from "./chunk-WZ457PEQ.mjs";
import {
  readJsonFile
} from "./chunk-LBCPJOAV.mjs";
import {
  readVirtualFile
} from "./chunk-IGMAXVPP.mjs";
import {
  VirtualFile
} from "./chunk-ZJRWU4AJ.mjs";
import {
  deepClone
} from "./chunk-Z2JQNSVL.mjs";

// src/manifest/manifest.ts
import { getErrorMessage } from "@metamask/snaps-sdk";
import { assertExhaustive, assert, isPlainObject } from "@metamask/utils";
import deepEqual from "fast-deep-equal";
import { promises as fs } from "fs";
import pathUtils from "path";
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
async function checkManifest(basePath, writeManifest = true, sourceCode, writeFileFn = fs.writeFile) {
  const warnings = [];
  const errors = [];
  let updated = false;
  const manifestPath = pathUtils.join(basePath, "snap.manifest.json" /* Manifest */);
  const manifestFile = await readJsonFile(manifestPath);
  const unvalidatedManifest = manifestFile.result;
  const packageFile = await readJsonFile(
    pathUtils.join(basePath, "package.json" /* PackageJson */)
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
    if (error instanceof ProgrammaticallyFixableSnapError) {
      errors.push(error.message);
      const partiallyValidatedFiles = snapFiles;
      let isInvalid = true;
      let currentError = error;
      const maxAttempts = Object.keys(SnapValidationFailureReason).length;
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
          if (!(nextValidationError instanceof ProgrammaticallyFixableSnapError) || attempts === maxAttempts && !isInvalid) {
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
  assert(manifest);
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
  const iconDimensions = snapFiles.svgIcon && getSvgDimensions(snapFiles.svgIcon.toString());
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
          pathUtils.join(basePath, "snap.manifest.json" /* Manifest */),
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
      manifestCopy.repository = packageJson.result.repository ? deepClone(packageJson.result.repository) : void 0;
      break;
    case '"shasum" field mismatch' /* ShasumMismatch */:
      manifestCopy.source.shasum = await getSnapChecksum(snapFiles);
      break;
    default:
      assertExhaustive(error.reason);
  }
  clonedFile.result = manifestCopy;
  clonedFile.value = JSON.stringify(manifestCopy);
  return clonedFile;
}
async function getSnapSourceCode(basePath, manifest, sourceCode) {
  if (!isPlainObject(manifest)) {
    return void 0;
  }
  const sourceFilePath = manifest.source?.location?.npm?.filePath;
  if (!sourceFilePath) {
    return void 0;
  }
  if (sourceCode) {
    return new VirtualFile({
      path: pathUtils.join(basePath, sourceFilePath),
      value: sourceCode
    });
  }
  try {
    const virtualFile = await readVirtualFile(
      pathUtils.join(basePath, sourceFilePath),
      "utf8"
    );
    return virtualFile;
  } catch (error) {
    throw new Error(
      `Failed to read snap bundle file: ${getErrorMessage(error)}`
    );
  }
}
async function getSnapIcon(basePath, manifest) {
  if (!isPlainObject(manifest)) {
    return void 0;
  }
  const iconPath = manifest.source?.location?.npm?.iconPath;
  if (!iconPath) {
    return void 0;
  }
  try {
    const virtualFile = await readVirtualFile(
      pathUtils.join(basePath, iconPath),
      "utf8"
    );
    return virtualFile;
  } catch (error) {
    throw new Error(`Failed to read snap icon file: ${getErrorMessage(error)}`);
  }
}
function getSnapFilePaths(manifest, selector) {
  if (!isPlainObject(manifest)) {
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
        async (filePath) => readVirtualFile(pathUtils.join(basePath, filePath), encoding)
      )
    );
  } catch (error) {
    throw new Error(`Failed to read snap files: ${getErrorMessage(error)}`);
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
    throw new ProgrammaticallyFixableSnapError(
      `"${"snap.manifest.json" /* Manifest */}" npm package name ("${manifestPackageName}") does not match the "${"package.json" /* PackageJson */}" "name" field ("${packageJsonName}").`,
      '"name" field mismatch' /* NameMismatch */
    );
  }
  if (packageJsonVersion !== manifestPackageVersion) {
    throw new ProgrammaticallyFixableSnapError(
      `"${"snap.manifest.json" /* Manifest */}" npm package version ("${manifestPackageVersion}") does not match the "${"package.json" /* PackageJson */}" "version" field ("${packageJsonVersion}").`,
      '"version" field mismatch' /* VersionMismatch */
    );
  }
  if (
    // The repository may be `undefined` in package.json but can only be defined
    // or `null` in the Snap manifest due to TS@<4.4 issues.
    (packageJsonRepository || manifestRepository) && !deepEqual(packageJsonRepository, manifestRepository)
  ) {
    throw new ProgrammaticallyFixableSnapError(
      `"${"snap.manifest.json" /* Manifest */}" "repository" field does not match the "${"package.json" /* PackageJson */}" "repository" field.`,
      '"repository" field mismatch' /* RepositoryMismatch */
    );
  }
  await validateSnapShasum(
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
    assertIsSnapManifest(manifest.result);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ""}${error.message}`);
  }
  const validatedManifest = manifest;
  const { iconPath } = validatedManifest.result.source.location.npm;
  if (iconPath && !svgIcon) {
    throw new Error(`Missing file "${iconPath}".`);
  }
  try {
    assertIsNpmSnapPackageJson(packageJson.result);
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
      assertIsSnapIcon(svgIcon);
    } catch (error) {
      throw new Error(`${errorPrefix ?? ""}${error.message}`);
    }
  }
  if (localizationFiles) {
    try {
      getValidatedLocalizationFiles(localizationFiles);
      validateSnapManifestLocalizations(
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

export {
  EXPECTED_SNAP_FILES,
  SnapFileNameFromKey,
  validateNpmSnap,
  checkManifest,
  fixManifest,
  getSnapSourceCode,
  getSnapIcon,
  getSnapFilePaths,
  getSnapFiles,
  getWritableManifest,
  validateNpmSnapManifest
};
//# sourceMappingURL=chunk-2OJY3BXD.mjs.map