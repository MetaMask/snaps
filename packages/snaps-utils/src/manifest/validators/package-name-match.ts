import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Check if the package name in manifest matches package.json name.
 */
export const packageNameMatch: ValidatorMeta = {
  severity: 'error',
  semanticCheck(files, context) {
    const packageJsonName = files.packageJson.result.name;
    const manifestPackageName =
      files.manifest.mergedManifest.source?.location?.npm?.packageName;
    if (packageJsonName !== manifestPackageName) {
      context.report(
        'package-name-match',
        `"${NpmSnapFileNames.Manifest}" npm package name ("${manifestPackageName}") does not match the "${NpmSnapFileNames.PackageJson}" "name" field ("${packageJsonName}").`,
        ({ manifest }) => {
          manifest.mainManifest.result.source ??= {};
          manifest.mainManifest.result.source.location ??= {};
          manifest.mainManifest.result.source.location.npm ??= {};
          manifest.mainManifest.result.source.location.npm.packageName =
            packageJsonName;

          return { manifest };
        },
      );
    }
  },
};
