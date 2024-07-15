/* eslint-disable @typescript-eslint/naming-convention */

import { getDesignTokens } from './utils';

export const borders = {
  muted: {
    default: `1px solid ${getDesignTokens('colors').border.muted.default}`,
    _dark: `1px solid ${getDesignTokens('colors').border.muted._dark}`,
  },
};
