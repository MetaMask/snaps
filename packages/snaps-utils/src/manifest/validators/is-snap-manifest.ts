import { validate } from '@metamask/superstruct';

import { NpmSnapFileNames } from '../../types';
import { SnapManifestStruct } from '../validation';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the structure of snap.manifest.json
 */
export const isSnapManifest: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    if (!files.manifest) {
      return;
    }
    const [error] = validate(files.manifest.result, SnapManifestStruct);
    if (error) {
      for (const failure of error.failures()) {
        context.report(
          `"${NpmSnapFileNames.Manifest}" is invalid: ${failure.message}`,
        );
      }
    }
  },
};
