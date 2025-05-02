import { handlerEndowments } from '@metamask/snaps-rpc-methods';
import { checkManifest } from '@metamask/snaps-utils/node';
import { writeManifest } from '@metamask/snaps-webpack-plugin';
import { red, yellow } from 'chalk';
import fs from 'fs';
import type { Ora } from 'ora';
import { dirname, resolve as pathResolve } from 'path';

import type { ProcessedConfig } from '../../config';
import { log } from '../../utils';
import { formatError } from '../../webpack/utils';

/**
 * The stats returned by the {@link manifest} function.
 */
export type ManifestStats = {
  /**
   * Whether the manifest is valid, i.e., it has no errors. The manifest is
   * considered valid even if it has warnings.
   */
  valid: boolean;

  /**
   * The number of errors found in the manifest. This does not include fixed
   * issues.
   */
  errors: number;

  /**
   * The number of warnings found in the manifest. This does not include fixed
   * issues.
   */
  warnings: number;

  /**
   * The number of issues that were fixed in the manifest.
   */
  fixed: number;
};

/**
 * Check the snap manifest file at the given path. If `write` is `true`, the
 * manifest will be written to disk if it is invalid. If `write` is `false`,
 * the manifest will not be written to disk, and the function will log any
 * errors and warnings to the console.
 *
 * @param config - The config object.
 * @param manifestPath - The path to the manifest file.
 * @param write - Whether to write the manifest to disk if it is invalid.
 * @param exports - The exports to check in the manifest.
 * @param spinner - An optional spinner to use for logging.
 * @returns Whether the manifest is valid.
 */
export async function manifest(
  config: ProcessedConfig,
  manifestPath: string,
  write: boolean,
  exports?: string[],
  spinner?: Ora,
): Promise<ManifestStats> {
  const bundlePath = pathResolve(
    process.cwd(),
    config.output.path,
    config.output.filename,
  );

  const { reports } = await checkManifest(dirname(manifestPath), {
    updateAndWriteManifest: write,
    sourceCode: await fs.promises.readFile(bundlePath, 'utf-8'),
    exports,
    handlerEndowments,
    writeFileFn: async (path, data) => {
      return writeManifest(path, data);
    },
  });

  // TODO: Use `Object.groupBy` when available.
  const errors = reports
    .filter((report) => report.severity === 'error' && !report.wasFixed)
    .map((report) => report.message);
  const warnings = reports
    .filter((report) => report.severity === 'warning' && !report.wasFixed)
    .map((report) => report.message);
  const fixed = reports
    .filter((report) => report.wasFixed)
    .map((report) => report.message);

  if (errors.length > 0 || warnings.length > 0) {
    log('', spinner);
  }

  if (errors.length > 0) {
    log(
      errors.map((value) => formatError(value, '', red)).join('\n\n'),
      spinner,
    );

    log('', spinner);
  }

  if (warnings.length > 0) {
    log(
      warnings.map((value) => formatError(value, '', yellow)).join('\n\n'),
      spinner,
    );

    log('', spinner);
  }

  return {
    valid: errors.length === 0,
    errors: errors.length,
    warnings: warnings.length,
    fixed: fixed.length,
  };
}
