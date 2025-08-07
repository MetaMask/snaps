import { assert } from '@metamask/utils';

import { assertIsSnapIcon } from '../../icon';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verify the structure of the snap icon.
 */
export const isSnapIcon: ValidatorMeta = {
  severity: 'error',
  structureCheck(files, context) {
    if (!files.svgIcon) {
      return;
    }

    try {
      assertIsSnapIcon(files.svgIcon);
    } catch (error) {
      assert(error instanceof Error);
      context.report('is-snap-icon', error.message);
    }
  },
};
