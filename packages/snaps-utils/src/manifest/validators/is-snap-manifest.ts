import { validate } from '@metamask/superstruct';

import { getStructFailureMessage } from '../../structs';
import { NpmSnapFileNames } from '../../types';
import { SnapManifestStruct } from '../validation';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verify the structure of snap.manifest.json.
 */
export const isSnapManifest: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    if (!files.manifest) {
      return;
    }
    const [error] = validate(files.manifest.mergedManifest, SnapManifestStruct);
    if (error) {
      for (const failure of error.failures()) {
        context.report(
          `is-snap-manifest-${failure.type}-${failure.path.join('-')}`,
          `"${NpmSnapFileNames.Manifest}" is invalid: ${getStructFailureMessage(
            SnapManifestStruct,
            failure,
            false,
          )}`,
        );
      }
    }
  },
};
