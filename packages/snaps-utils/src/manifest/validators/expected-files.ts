import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

const EXPECTED_SNAP_FILES = ['manifest', 'packageJson', 'sourceCode'] as const;

const SnapFileNameFromKey = {
  manifest: NpmSnapFileNames.Manifest,
  packageJson: NpmSnapFileNames.PackageJson,
  sourceCode: 'source code bundle',
} as const;

/**
 * Checks if all the required files are included.
 */
export const expectedFiles: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    for (const expectedFile of EXPECTED_SNAP_FILES) {
      if (!files[expectedFile]) {
        context.report(`Missing file "${SnapFileNameFromKey[expectedFile]}".`);
      }
    }
  },
  semanticCheck(files, ctx) {
    const { iconPath } = files.manifest.result.source.location.npm;
    if (iconPath && !files.svgIcon) {
      ctx.report(`Missing file "${iconPath}".`);
    }
  },
};
