import { checkManifest, logError, logWarning } from '@metamask/snaps-utils';

import type { ProcessedConfig } from '../../config';

const ERROR_PREFIX = 'Manifest Error: ';

/**
 * Get whether to write the manifest to disk.
 *
 * @param config - The config object.
 * @returns Whether to write the manifest to disk.
 */
function getWriteManifest(config: ProcessedConfig) {
  if (config.bundler === 'browserify') {
    return config.cliOptions.writeManifest;
  }

  return config.manifest.update;
}

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param config - The config object.
 */
export async function manifest(config: ProcessedConfig) {
  try {
    const writeManifest = getWriteManifest(config);
    const { warnings, errors } = await checkManifest(
      process.cwd(),
      Boolean(writeManifest),
    );

    if (!writeManifest && errors.length > 0) {
      logError(`${ERROR_PREFIX}The manifest is invalid.`);
      errors.forEach(logManifestError);

      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    }

    if (warnings.length > 0) {
      logWarning(
        'Manifest Warning: Validation of snap.manifest.json completed with warnings.',
      );
      warnings.forEach((warning) => logManifestWarning(config, warning));
    }
  } catch (error) {
    throw new Error(`${ERROR_PREFIX}${error}`);
  }
}

/**
 * Logs a manifest warning, if `suppressWarnings` is not enabled.
 *
 * @param config - The config object.
 * @param message - The message to log.
 */
function logManifestWarning(config: ProcessedConfig, message: string) {
  if (config.bundler === 'webpack' || !config.cliOptions.suppressWarnings) {
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
