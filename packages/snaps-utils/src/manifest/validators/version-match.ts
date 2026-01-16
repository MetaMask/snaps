import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Check if the version in manifest is the same as in package.json.
 */
export const versionMatch: ValidatorMeta = {
  severity: 'error',
  semanticCheck(files, context) {
    const packageJsonVersion = files.packageJson.result.version;
    const manifestPackageVersion = files.manifest.mergedManifest.version;
    if (packageJsonVersion !== manifestPackageVersion) {
      context.report(
        'version-match',
        `"${NpmSnapFileNames.Manifest}" npm package version ("${manifestPackageVersion}") does not match the "${NpmSnapFileNames.PackageJson}" "version" field ("${packageJsonVersion}").`,
        ({ manifest }) => {
          manifest.baseManifest.result.version = packageJsonVersion;
          return { manifest };
        },
      );
    }
  },
};
