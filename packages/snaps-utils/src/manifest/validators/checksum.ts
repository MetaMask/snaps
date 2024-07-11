import { getSnapChecksum } from '../../snaps';
import type { FetchedSnapFiles } from '../../types';
import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Checks if the checksum in manifest matches computed value.
 */
export const checksum: ValidatorMeta = {
  severity: 'error',
  async validatedCheck(files, context) {
    const fetchedFiles: FetchedSnapFiles = {
      manifest: files.manifest,
      sourceCode: files.sourceCode,
      auxiliaryFiles: files.auxiliaryFiles,
      localizationFiles: files.localizationFiles,
    };
    if (
      files.manifest.result.source.shasum !==
      (await getSnapChecksum(fetchedFiles))
    ) {
      context.report(
        `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum.`,
        async ({ manifest }) => {
          manifest.source.shasum = await getSnapChecksum(fetchedFiles);
          return { manifest };
        },
      );
    }
  },
};
