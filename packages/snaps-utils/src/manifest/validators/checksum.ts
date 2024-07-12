import { getSnapChecksum } from '../../snaps';
import type { FetchedSnapFiles } from '../../types';
import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Checks if the checksum in manifest matches computed value.
 */
export const checksum: ValidatorMeta = {
  severity: 'error',
  async semanticCheck(files, context) {
    const fetchedFiles: FetchedSnapFiles = {
      manifest: files.manifest,
      sourceCode: files.sourceCode,
      auxiliaryFiles: files.auxiliaryFiles,
      localizationFiles: files.localizationFiles,
    };
    const gotChecksum = files.manifest.result.source.shasum;
    const expectedChecksum = await getSnapChecksum(fetchedFiles);
    if (gotChecksum !== expectedChecksum) {
      context.report(
        `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum. Got "${gotChecksum}", expected "${expectedChecksum}"`,
        async ({ manifest }) => {
          manifest.source.shasum = expectedChecksum;
          return { manifest };
        },
      );
    }
  },
};
