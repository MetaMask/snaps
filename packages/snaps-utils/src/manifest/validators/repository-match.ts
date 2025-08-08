import deepEqual from 'fast-deep-equal';

import { deepClone } from '../../deep-clone';
import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Check if the repository object in manifest is the same as in package.json.
 */
export const repositoryMatch: ValidatorMeta = {
  severity: 'error',
  semanticCheck(files, context) {
    const packageJsonRepository = files.packageJson.result.repository;
    const manifestRepository = files.manifest.result.repository;
    if (
      (packageJsonRepository || manifestRepository) &&
      !deepEqual(packageJsonRepository, manifestRepository)
    ) {
      context.report(
        'repository-match',
        `"${NpmSnapFileNames.Manifest}" "repository" field does not match the "${NpmSnapFileNames.PackageJson}" "repository" field.`,
        ({ manifest }) => {
          manifest.repository = packageJsonRepository
            ? deepClone(packageJsonRepository)
            : undefined;
          return { manifest };
        },
      );
    }
  },
};
