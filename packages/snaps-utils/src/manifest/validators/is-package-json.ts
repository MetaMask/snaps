import { validate } from '@metamask/superstruct';

import { getStructFailureMessage } from '../../structs';
import { NpmSnapFileNames, NpmSnapPackageJsonStruct } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verify the structure of package.json.
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
          `is-package-json-${failure.type}-${failure.path.join('-')}`,
          `"${
            NpmSnapFileNames.PackageJson
          }" is invalid: ${getStructFailureMessage(
            NpmSnapPackageJsonStruct,
            failure,
            false,
          )}`,
        );
      }
    }
  },
};
