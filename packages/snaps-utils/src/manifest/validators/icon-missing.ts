import { NpmSnapFileNames } from '../../types';
import type { ValidatorMeta } from '../validator-types';

/**
 * Checks if declared icon exists on filesystem.
 */
export const iconMissing: ValidatorMeta = {
  severity: 'error',
  semanticCheck(files, context) {
    const { iconPath } = files.manifest.result.source.location.npm;
    if (iconPath && !files.svgIcon) {
      context.report(
        `Icon declared in ${NpmSnapFileNames.Manifest}, but is missing in filesystem.`,
      );
    }
  },
};
