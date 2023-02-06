import { checkManifest, logError, logWarning } from '@metamask/snaps-utils';

import { YargsArgs } from '../../types/yargs';

const ERROR_PREFIX = 'Manifest Error: ';

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param argv - The Yargs `argv` object.
 * @param argv.writeManifest - Whether to write the fixed manifest to disk.
 */
export async function manifestHandler({ writeManifest }: YargsArgs) {
  try {
    const { warnings, errors } = await checkManifest(
      process.cwd(),
      Boolean(writeManifest),
    );

    if (!writeManifest && errors.length > 0) {
      logError(`${ERROR_PREFIX}The manifest is invalid.`);
      errors.forEach(logManifestError);

      process.exit(1);
    }

    if (warnings.length > 0) {
      logWarning(
        'Manifest Warning: Validation of snap.manifest.json completed with warnings.',
      );
      warnings.forEach(logManifestWarning);
    }
  } catch (error) {
    throw new Error(`${ERROR_PREFIX}${error}`);
  }
}

/**
 * Logs a manifest warning, if `suppressWarnings` is not enabled.
 *
 * @param message - The message to log.
 */
function logManifestWarning(message: string) {
  if (!global.snaps.suppressWarnings) {
    logWarning(`Manifest Warning: ${message}`);
  }
}

/**
 * Logs a manifest error.
 *
 * @param message - The message to log.
 */
function logManifestError(message: string) {
  logError(`${ERROR_PREFIX}${message}`);
}
