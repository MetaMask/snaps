import { getSnapChecksum } from '../../snaps';
import type { FetchedSnapFiles } from '../../types';
import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Check if the checksum in manifest matches computed value.
 */
export const checksum: ValidatorMeta = {
  severity: 'error',
  async semanticCheck(files, context) {
    const fetchedFiles: FetchedSnapFiles = files;
    const gotChecksum = files.manifest.result.source.shasum;
    const expectedChecksum = await getSnapChecksum(fetchedFiles);
    if (gotChecksum !== expectedChecksum) {
      context.report(
        'checksum',
        `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum. Got "${gotChecksum}", expected "${expectedChecksum}".`,
        async ({ manifest }) => {
          manifest.source.shasum = expectedChecksum;
          return { manifest };
        },
      );
    }
  },
};
