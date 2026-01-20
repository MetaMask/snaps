import { getSnapChecksum } from '../../snaps';
import type { FetchedSnapFiles } from '../../types';
import { NpmSnapFileNames } from '../../types';
import type { VirtualFile } from '../../virtual-file';
import type { SnapManifest } from '../validation';
import type { ValidatorMeta } from '../validator-types';

/**
 * Check if the checksum in manifest matches computed value.
 */
export const checksum: ValidatorMeta = {
  severity: 'error',
  async semanticCheck(files, context) {
    const mergedManifest =
      files.manifest.mainManifest.clone() as VirtualFile<SnapManifest>;
    mergedManifest.result = files.manifest.mergedManifest;
    mergedManifest.value = JSON.stringify(files.manifest.mergedManifest);

    const fetchedFiles: FetchedSnapFiles = {
      ...files,
      manifest: mergedManifest,
    };

    const gotChecksum = files.manifest.mergedManifest.source.shasum;
    const expectedChecksum = await getSnapChecksum(fetchedFiles);
    if (gotChecksum !== expectedChecksum) {
      context.report(
        'checksum',
        `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum. Got "${gotChecksum}", expected "${expectedChecksum}".`,
        async ({ manifest }) => {
          manifest.mainManifest.result ??= {};
          manifest.mainManifest.result.source ??= {};
          manifest.mainManifest.result.source.shasum = expectedChecksum;
          return { manifest };
        },
      );
    }
  },
};
