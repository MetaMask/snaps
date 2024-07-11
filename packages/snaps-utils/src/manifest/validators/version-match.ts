import { NpmSnapFileNames } from 'src/types';

import type { ValidatorMeta } from '../validator-types';

/**
 * Checks if the version in manifest is the same as in package.json
 */
export const VersionMatch: ValidatorMeta = {
  severity: 'error',
  validatedCheck(files, context) {
    const packageJsonVersion = files.packageJson.result.version;
    const manifestPackageVersion = files.manifest.result.version;
    if (packageJsonVersion !== manifestPackageVersion) {
      context.report(
        `"${NpmSnapFileNames.Manifest}" npm package version ("${manifestPackageVersion}") does not match the "${NpmSnapFileNames.PackageJson}" "version" field ("${packageJsonVersion}").`,
        () => {
          const manifest = files.manifest.clone().result;
          manifest.version = packageJsonVersion;
          return { manifest };
        },
      );
    }
  },
};
