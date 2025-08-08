import type { ValidatorMeta } from '../validator-types';

/**
 * Check if declared icon exists on filesystem.
 */
export const iconMissing: ValidatorMeta = {
  severity: 'error',
  semanticCheck(files, context) {
    const { iconPath } = files.manifest.result.source.location.npm;
    if (iconPath && !files.svgIcon) {
      context.report('icon-missing', `Could not find icon "${iconPath}".`);
    }
  },
};
