import { validate } from '@metamask/superstruct';

import { NpmSnapFileNames, NpmSnapPackageJsonStruct } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the structure of package.json
 */
export const isPackageJson: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    if (!files.packageJson) {
      return;
    }
    const [error] = validate(
      files.packageJson.result,
      NpmSnapPackageJsonStruct,
    );
    if (error) {
      for (const failure of error.failures()) {
        context.report(
          `"${NpmSnapFileNames.PackageJson}" is invalid: ${failure.message}`,
        );
      }
    }
  },
};
