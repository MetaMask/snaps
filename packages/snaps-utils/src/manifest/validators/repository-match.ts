import deepEqual from 'fast-deep-equal';
import { deepClone } from 'src/deep-clone';
import { NpmSnapFileNames } from 'src/types';

import type { ValidatorMeta } from '../validator-types';

/**
 * Checks if the repository object in manifest is the same as in package.json
 */
export const repositoryMatch: ValidatorMeta = {
  severity: 'error',
  validatedCheck(files, context) {
    const packageJsonRepository = files.packageJson.result.repository;
    const manifestRepository = files.manifest.result.repository;
    if (
      (packageJsonRepository || manifestRepository) &&
      !deepEqual(packageJsonRepository, manifestRepository)
    ) {
      context.report(
        `"${NpmSnapFileNames.Manifest}" "repository" field does not match the "${NpmSnapFileNames.PackageJson}" "repository" field.`,
        () => {
          const manifest = files.manifest.clone().result;
          manifest.repository = packageJsonRepository
            ? deepClone(packageJsonRepository)
            : undefined;
          return { manifest };
        },
      );
    }
  },
};
