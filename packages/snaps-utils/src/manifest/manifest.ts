import { getErrorMessage } from '@metamask/snaps-sdk';
import type { Json } from '@metamask/utils';
import { assert, isPlainObject } from '@metamask/utils';
import deepmerge from 'deepmerge';
import { promises as fs } from 'fs';
import pathUtils, { dirname } from 'path';

import type { SnapManifest } from './validation';
import type { ValidatorResults } from './validator';
import { hasFixes, isReportFixable, runValidators } from './validator';
import type { ValidatorMeta, ValidatorReport } from './validator-types';
import * as defaultValidators from './validators';
import { deepClone } from '../deep-clone';
import { readJsonFile } from '../fs';
import { parseJson } from '../json';
import type {
  DeepPartial,
  ExtendableSnapFiles,
  UnvalidatedExtendableManifest,
  UnvalidatedSnapFiles,
} from '../types';
import { NpmSnapFileNames } from '../types';
import { readVirtualFile, VirtualFile } from '../virtual-file/node';

const MANIFEST_SORT_ORDER: Record<keyof SnapManifest, number> = {
  $schema: 1,
  extends: 2,
  version: 3,
  description: 4,
  proposedName: 5,
  repository: 6,
  source: 7,
  initialConnections: 8,
  initialPermissions: 9,
  platformVersion: 10,
  manifestVersion: 11,
};

type MergedManifest<Type> =
  Type extends DeepPartial<SnapManifest> ? SnapManifest : Json;

/**
 * Merge two Snap manifests, with the extended manifest taking precedence
 * over the base manifest.
 *
 * @param baseManifest - The base manifest.
 * @param extendedManifest - The extended manifest.
 * @returns The merged manifest.
 */
function mergeManifests<Type>(
  baseManifest: Type,
  extendedManifest?: Type,
): MergedManifest<Type> {
  if (!extendedManifest) {
    return baseManifest as MergedManifest<Type>;
  }

  assert(isPlainObject(baseManifest));
  assert(isPlainObject(extendedManifest));

  const mergedManifest = deepmerge(extendedManifest, baseManifest);
  delete mergedManifest.extends;

  return getWritableManifest(mergedManifest) as MergedManifest<Type>;
}

/**
 * Load a manifest and its extended manifest if it has one.
 *
 * Note: This function does not validate the manifests.
 *
 * @param manifestPath - The path to the manifest file.
 * @param files - A set of already loaded manifest file paths to prevent
 * circular dependencies.
 * @param root - Whether this is the root manifest being loaded. Used for
 * recursive calls, and should not be set by callers.
 * @returns The base and extended manifests.
 */
export async function loadManifest(
  manifestPath: string,
  files = new Set<string>(),
  root = true,
): Promise<UnvalidatedExtendableManifest> {
  assert(
    pathUtils.isAbsolute(manifestPath),
    'The `loadManifest` function must be called with an absolute path.',
  );

  if (files.has(manifestPath)) {
    throw new Error(
      `Failed to load Snap manifest: Circular dependency detected when loading "${manifestPath}".`,
    );
  }

  const baseManifest = await readJsonFile(manifestPath);
  files.add(manifestPath);

  if (!isPlainObject(baseManifest.result)) {
    throw new Error(
      `Failed to load Snap manifest: The Snap manifest file at "${manifestPath}" must contain a JSON object.`,
    );
  }

  if (
    baseManifest.result.extends &&
    typeof baseManifest.result.extends === 'string'
  ) {
    const fileName = pathUtils.basename(manifestPath);
    if (root && fileName === 'snap.manifest.json') {
      throw new Error(
        `Failed to load Snap manifest: The Snap manifest file at "snap.manifest.json" cannot extend another manifest.`,
      );
    }

    const extendedManifestPath = pathUtils.resolve(
      pathUtils.dirname(manifestPath),
      baseManifest.result.extends,
    );

    const extendedManifest = await loadManifest(
      extendedManifestPath,
      files,
      false,
    );

    return {
      baseManifest,
      extendedManifest: extendedManifest.baseManifest,
      mergedManifest: mergeManifests(
        baseManifest.result,
        extendedManifest.mergedManifest,
      ),
      files,
    };
  }

  return {
    baseManifest,
    mergedManifest: baseManifest.result,
    files,
  };
}

export type CheckManifestReport = Omit<ValidatorReport, 'fix'> & {
  wasFixed?: boolean;
};

/**
 * The options for the `checkManifest` function.
 */
export type CheckManifestOptions = {
  /**
   * Whether to auto-magically try to fix errors and then write the manifest to
   * disk.
   */
  updateAndWriteManifest?: boolean;

  /**
   * The source code of the Snap.
   */
  sourceCode?: string;

  /**
   * The function to use to write the manifest to disk.
   */
  writeFileFn?: WriteFileFunction;

  /**
   * The exports detected by evaluating the bundle. This may be used by one or
   * more validators to determine whether the Snap is valid.
   */
  exports?: string[];

  /**
   * An object containing the names of the handlers and their respective
   * permission name. This must be provided to avoid circular dependencies
   * between `@metamask/snaps-utils` and `@metamask/snaps-rpc-methods`.
   */
  handlerEndowments?: Record<string, string | null>;

  /**
   * Whether the compiler is running in watch mode. This is used to determine
   * whether to fix warnings or errors only.
   */
  watchMode?: boolean;
};

/**
 * The result from the `checkManifest` function.
 *
 * @property manifest - The fixed manifest object.
 * @property updated - Whether the manifest was written and updated.
 */
export type CheckManifestResult = {
  files?: ExtendableSnapFiles;
  updated: boolean;
  reports: CheckManifestReport[];
};

export type WriteFileFunction = (path: string, data: string) => Promise<void>;

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param manifestPath - The path to the manifest file.
 * @param options - Additional options for the function.
 * @param options.sourceCode - The source code of the Snap.
 * @param options.writeFileFn - The function to use to write the manifest to
 * disk.
 * @param options.updateAndWriteManifest - Whether to auto-magically try to fix
 * errors and then write the manifest to disk.
 * @param options.exports - The exports detected by evaluating the bundle. This
 * may be used by one or more validators to determine whether the Snap is valid.
 * @param options.handlerEndowments - An object containing the names of the
 * handlers and their respective permission name. This must be provided to avoid
 * circular dependencies between `@metamask/snaps-utils` and
 * `@metamask/snaps-rpc-methods`.
 * @param options.watchMode - Whether the compiler is running in watch mode.
 * This is used to determine whether to fix warnings or errors only.
 * @returns Whether the manifest was updated, and an array of warnings that
 * were encountered during processing of the manifest files.
 */
export async function checkManifest(
  manifestPath: string,
  {
    updateAndWriteManifest = true,
    sourceCode,
    writeFileFn = fs.writeFile,
    exports,
    handlerEndowments,
    watchMode = false,
  }: CheckManifestOptions = {},
): Promise<CheckManifestResult> {
  const basePath = dirname(manifestPath);
  const extendableManifest = await loadManifest(manifestPath);
  const unvalidatedManifest = extendableManifest.mergedManifest;

  const packageFile = await readJsonFile(
    pathUtils.join(basePath, NpmSnapFileNames.PackageJson),
  );

  const auxiliaryFilePaths = getSnapFilePaths(
    unvalidatedManifest,
    (manifest) => manifest?.source?.files,
  );

  const localizationFilePaths = getSnapFilePaths(
    unvalidatedManifest,
    (manifest) => manifest?.source?.locales,
  );
  const localizationFiles =
    (await getSnapFiles(basePath, localizationFilePaths)) ?? [];
  for (const localization of localizationFiles) {
    try {
      localization.result = parseJson(localization.toString());
    } catch (error) {
      assert(error instanceof SyntaxError, error);
      throw new Error(
        `Failed to parse localization file "${localization.path}" as JSON.`,
      );
    }
  }

  const snapFiles: UnvalidatedSnapFiles = {
    manifest: extendableManifest,
    packageJson: packageFile,
    sourceCode: await getSnapSourceCode(
      basePath,
      unvalidatedManifest,
      sourceCode,
    ),
    svgIcon: await getSnapIcon(basePath, unvalidatedManifest),
    // Intentionally pass null as the encoding here since the files may be binary
    auxiliaryFiles:
      (await getSnapFiles(basePath, auxiliaryFilePaths, null)) ?? [],
    localizationFiles,
  };

  const validatorResults = await runValidators(
    snapFiles,
    Object.values(defaultValidators),
    { exports, handlerEndowments },
  );

  let manifestResults: CheckManifestResult = {
    updated: false,
    files: validatorResults.files,
    reports: validatorResults.reports,
  };

  if (updateAndWriteManifest && hasFixes(manifestResults, watchMode)) {
    const fixedResults = await runFixes(validatorResults, undefined, watchMode);

    if (fixedResults.updated) {
      manifestResults = fixedResults;

      assert(manifestResults.files);

      try {
        await writeFileFn(
          manifestPath,
          manifestResults.files.manifest.baseManifest.toString(),
        );
      } catch (error) {
        // Note: This error isn't pushed to the errors array, because it's not an
        // error in the manifest itself.
        throw new Error(
          `Failed to update "snap.manifest.json": ${getErrorMessage(error)}`,
        );
      }
    }
  }

  return manifestResults;
}

/**
 * Run the algorithm for automatically fixing errors in manifest.
 *
 * The algorithm updates the manifest by fixing all fixable problems,
 * and then run validation again to check if the new manifest is now correct.
 * If not correct, the algorithm will use the manifest from previous iteration
 * and try again `MAX_ATTEMPTS` times to update it before bailing and
 * resulting in failure.
 *
 * @param results - Results of the initial run of validation.
 * @param rules - Optional list of rules to run the fixes with.
 * @param errorsOnly - Whether to only run fixes for errors, not warnings.
 * @returns The updated manifest and whether it was updated.
 */
export async function runFixes(
  results: ValidatorResults,
  rules?: ValidatorMeta[],
  errorsOnly = false,
): Promise<CheckManifestResult> {
  let shouldRunFixes = true;
  const MAX_ATTEMPTS = 10;

  assert(results.files);

  let fixResults: ValidatorResults = results;
  assert(fixResults.files);

  fixResults.files.manifest.baseManifest =
    fixResults.files.manifest.baseManifest.clone();

  const mergedReports: ValidatorReport[] = deepClone(fixResults.reports);

  for (
    let attempts = 1;
    shouldRunFixes && attempts <= MAX_ATTEMPTS;
    attempts++
  ) {
    assert(fixResults.files);

    const fixable = fixResults.reports.filter((report) =>
      isReportFixable(report, errorsOnly),
    );

    let { manifest } = fixResults.files;
    for (const report of fixable) {
      assert(report.fix);
      ({ manifest } = await report.fix({ manifest }));

      manifest.mergedManifest = mergeManifests(
        manifest.baseManifest.result,
        manifest.extendedManifest?.result,
      );
    }

    // The `baseManifest` is always the first manifest loaded, and is the one
    // that should be updated with fixes. Any manifests that the base manifest
    // extends will not be updated.
    // We can revisit this in the future if we want to support fixing extended
    // manifests as well, but it adds complexity, as we'd need to track which
    // fixes apply to which manifest.
    fixResults.files.manifest.baseManifest.value = `${JSON.stringify(
      getWritableManifest(manifest.baseManifest.result),
      null,
      2,
    )}\n`;
    fixResults.files.manifest = manifest;
    fixResults.files.manifest.mergedManifest = mergeManifests(
      fixResults.files.manifest.baseManifest.result,
      fixResults.files.manifest.extendedManifest?.result,
    );

    fixResults = await runValidators(fixResults.files, rules);
    shouldRunFixes = hasFixes(fixResults, errorsOnly);

    fixResults.reports
      .filter(
        (report) =>
          !mergedReports.some((mergedReport) => mergedReport.id === report.id),
      )
      .forEach((report) => mergedReports.push(report));
  }

  const allReports: (CheckManifestReport & ValidatorReport)[] =
    deepClone(mergedReports);

  // Was fixed
  if (!shouldRunFixes) {
    for (const report of allReports) {
      if (report.fix) {
        report.wasFixed = true;
        delete report.fix;
      }
    }

    return {
      files: fixResults.files,
      updated: true,
      reports: allReports,
    };
  }

  for (const report of allReports) {
    delete report.fix;
  }

  return {
    files: results.files,
    updated: false,
    reports: allReports,
  };
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * bundle source file location and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @param sourceCode - Override source code for plugins.
 * @returns The contents of the bundle file, if any.
 */
export async function getSnapSourceCode(
  basePath: string,
  manifest: Json,
  sourceCode?: string,
): Promise<VirtualFile | undefined> {
  if (!isPlainObject(manifest)) {
    return undefined;
  }

  const sourceFilePath = (manifest as Partial<SnapManifest>).source?.location
    ?.npm?.filePath;

  if (!sourceFilePath) {
    return undefined;
  }

  if (sourceCode) {
    return new VirtualFile({
      path: pathUtils.join(basePath, sourceFilePath),
      value: sourceCode,
    });
  }

  try {
    const virtualFile = await readVirtualFile(
      pathUtils.join(basePath, sourceFilePath),
      'utf8',
    );
    return virtualFile;
  } catch (error) {
    throw new Error(
      `Failed to read snap bundle file: ${getErrorMessage(error)}`,
    );
  }
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * icon and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @returns The contents of the icon, if any.
 */
export async function getSnapIcon(
  basePath: string,
  manifest: Json,
): Promise<VirtualFile | undefined> {
  if (!isPlainObject(manifest)) {
    return undefined;
  }

  const iconPath = (manifest as Partial<SnapManifest>).source?.location?.npm
    ?.iconPath;

  if (!iconPath) {
    return undefined;
  }

  try {
    const virtualFile = await readVirtualFile(
      pathUtils.join(basePath, iconPath),
      'utf8',
    );
    return virtualFile;
  } catch (error) {
    throw new Error(`Failed to read snap icon file: ${getErrorMessage(error)}`);
  }
}

/**
 * Get an array of paths from an unvalidated Snap manifest.
 *
 * @param manifest - The unvalidated Snap manifest file contents.
 * @param selector - A function that returns the paths to the files.
 * @returns The paths to the files, if any.
 */
export function getSnapFilePaths(
  manifest: Json,
  selector: (manifest: Partial<SnapManifest>) => string[] | undefined,
) {
  if (!isPlainObject(manifest)) {
    return undefined;
  }

  const snapManifest = manifest as Partial<SnapManifest>;
  const paths = selector(snapManifest);

  if (!Array.isArray(paths)) {
    return undefined;
  }

  return paths;
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the files with the
 * given paths and read them.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param paths - The paths to the files.
 * @param encoding - An optional encoding to pass down to readVirtualFile.
 * @returns A list of auxiliary files and their contents, if any.
 */
export async function getSnapFiles(
  basePath: string,
  paths: string[] | undefined,
  encoding: BufferEncoding | null = 'utf8',
): Promise<VirtualFile[] | undefined> {
  if (!paths) {
    return undefined;
  }

  try {
    return await Promise.all(
      paths.map(async (filePath) =>
        readVirtualFile(pathUtils.join(basePath, filePath), encoding),
      ),
    );
  } catch (error) {
    throw new Error(`Failed to read snap files: ${getErrorMessage(error)}`);
  }
}

/**
 * Sorts the given manifest in our preferred sort order and removes the
 * `repository` field if it is falsy (it may be `null`).
 *
 * @param manifest - The manifest to sort and modify.
 * @returns The disk-ready manifest.
 */
export function getWritableManifest(
  manifest: DeepPartial<SnapManifest>,
): DeepPartial<SnapManifest> {
  const { repository, ...remaining } = manifest;

  const keys = Object.keys(
    repository ? { ...remaining, repository } : remaining,
  ) as (keyof SnapManifest)[];

  return keys
    .sort((a, b) => MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b])
    .reduce<DeepPartial<SnapManifest>>(
      (result, key) => ({
        ...result,
        [key]: manifest[key],
      }),
      {},
    );
}
