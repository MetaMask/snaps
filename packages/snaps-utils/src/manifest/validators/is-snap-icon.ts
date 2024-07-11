import { assert } from '@metamask/utils';

import { assertIsSnapIcon } from '../../icon';
import type { ValidatorMeta } from '../validator-types';

/**
 * Verifies the structure of snap icon
 */
export const isSnapIcon: ValidatorMeta = {
  severity: 'error',
  validationCheck(files, context) {
    if (!files.svgIcon) {
      return;
    }

    try {
      assertIsSnapIcon(files.svgIcon);
    } catch (error) {
      assert(error instanceof Error);
      context.report(error.message);
    }
  },
};
