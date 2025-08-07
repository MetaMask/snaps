import { getSvgDimensions } from '../../icon';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verify the icon is square.
 */
export const iconDimensions: ValidatorMeta = {
  severity: 'warning',
  semanticCheck(files, context) {
    if (!files.svgIcon) {
      return;
    }

    const dimensions = getSvgDimensions(files.svgIcon.toString());
    if (dimensions && dimensions?.height !== dimensions.width) {
      context.report(
        'icon-dimensions',
        'The icon in the Snap manifest is not square. It is recommended to use a square icon for the Snap.',
      );
    }
  },
};
