import { checkManifest, indent } from '@metamask/snaps-utils';
import { red, yellow } from 'chalk';
import type { Ora } from 'ora';
import { dirname } from 'path';

import { error, info, warn } from '../../utils';

/**
 * Check the snap manifest file at the given path. If `write` is `true`, the
 * manifest will be written to disk if it is invalid. If `write` is `false`,
 * the manifest will not be written to disk, and the function will log any
 * errors and warnings to the console.
 *
 * @param path - The path to the manifest file.
 * @param write - Whether to write the manifest to disk if it is invalid.
 * @param spinner - An optional spinner to use for logging.
 */
export async function manifest(
  path: string,
  write: boolean,
  spinner?: Ora,
): Promise<boolean> {
  const { warnings, errors, updated } = await checkManifest(
    dirname(path),
    write,
  );

  if (write && updated) {
    info('The snap manifest file has been updated.', spinner);
  }

  if (!write && errors.length > 0) {
    const formattedErrors = errors
      .map((manifestError) => indent(red(`• ${manifestError}`)))
      .join('\n');

    error(
      `The snap manifest file is invalid.\n\n${formattedErrors}\n\nRun the command with the \`--fix\` flag to attempt to fix the manifest.`,
      spinner,
    );

    spinner?.stop();
    process.exitCode = 1;
    return false;
  }

  if (warnings.length > 0) {
    const formattedWarnings = warnings.map((manifestWarning) =>
      indent(yellow(`• ${manifestWarning}`)),
    );

    warn(
      `The snap manifest file has warnings.\n\n${formattedWarnings.join('\n')}`,
      spinner,
    );
  }

  return true;
}
