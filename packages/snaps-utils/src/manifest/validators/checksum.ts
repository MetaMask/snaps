import { getSnapChecksum } from 'src/snaps';
import type { FetchedSnapFiles } from 'src/types';
import { NpmSnapFileNames } from 'src/types';

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
        async () => {
          const manifest = files.manifest.clone().result;
          manifest.source.shasum = await getSnapChecksum(fetchedFiles);
          return { manifest };
        },
      );
    }
  },
};
