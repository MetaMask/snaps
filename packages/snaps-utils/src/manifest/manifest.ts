import { getErrorMessage } from '@metamask/snaps-sdk';
import type { Json } from '@metamask/utils';
import { assert, isPlainObject } from '@metamask/utils';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import { deepClone } from '../deep-clone';
import { readJsonFile } from '../fs';
import type { UnvalidatedSnapFiles } from '../types';
import { NpmSnapFileNames } from '../types';
import { readVirtualFile, VirtualFile } from '../virtual-file/node';
import type { SnapManifest } from './validation';
import { runValidators } from './validator';

const MANIFEST_SORT_ORDER: Record<keyof SnapManifest, number> = {
  $schema: 1,
  version: 2,
  description: 3,
  proposedName: 4,
  repository: 5,
  source: 6,
  initialConnections: 7,
  initialPermissions: 8,
  manifestVersion: 9,
};

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
export type CheckManifestResult = {
  manifest?: SnapManifest;
  updated?: boolean;
  warnings: string[];
  errors: string[];
};

export type WriteFileFunction = (path: string, data: string) => Promise<void>;

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
export async function checkManifest(
  basePath: string,
  writeManifest = true,
  sourceCode?: string,
  writeFileFn: WriteFileFunction = fs.writeFile,
): Promise<CheckManifestResult> {
  let updated = false;

  const manifestPath = pathUtils.join(basePath, NpmSnapFileNames.Manifest);
  const manifestFile = await readJsonFile(manifestPath);
  const unvalidatedManifest = manifestFile.result;

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

  const snapFiles: UnvalidatedSnapFiles = {
    manifest: manifestFile,
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
    localizationFiles:
      (await getSnapFiles(basePath, localizationFilePaths)) ?? [],
  };

  let results = await runValidators(snapFiles);

  if (writeManifest && results.fixes.length) {
    let shouldRunFixes = true;
    const MAX_ATTEMPTS = 10;

    for (
      let attempts = 1;
      shouldRunFixes && attempts <= MAX_ATTEMPTS;
      attempts++
    ) {
      assert(results.files);
      let manifest = deepClone(results.files.manifest.result);

      for (const fix of results.fixes) {
        ({ manifest } = await fix({ manifest }));
      }

      results.files.manifest.value = `${JSON.stringify(
        getWritableManifest(manifest),
        null,
        2,
      )}\n`;
      results.files.manifest.result = manifest;

      results = await runValidators(results.files);
      shouldRunFixes = Boolean(results.fixes.length);
    }

    // If we fixed all the errors the files will exist
    if (results.files) {
      try {
        await writeFileFn(
          pathUtils.join(basePath, NpmSnapFileNames.Manifest),
          results.files.manifest.toString(),
        );

        updated = true;
      } catch (error) {
        // Note: This error isn't pushed to the errors array, because it's not an
        // error in the manifest itself.
        throw new Error(
          `Failed to update snap.manifest.json: ${error.message}`,
        );
      }
    }
  }

  return {
    manifest: results.files?.manifest.result,
    updated,
    warnings: results.warnings,
    errors: results.errors,
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
export function getWritableManifest(manifest: SnapManifest): SnapManifest {
  const { repository, ...remaining } = manifest;

  const keys = Object.keys(
    repository ? { ...remaining, repository } : remaining,
  ) as (keyof SnapManifest)[];

  const writableManifest = keys
    .sort((a, b) => MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b])
    .reduce<Partial<SnapManifest>>(
      (result, key) => ({
        ...result,
        [key]: manifest[key],
      }),
      {},
    );

  return writableManifest as SnapManifest;
}
