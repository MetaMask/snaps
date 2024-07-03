import { extendTheme } from '@chakra-ui/react';

import { SNAPS_COMPONENTS } from '../components';
import { borders } from './borders';
import { config } from './config';
import { lineHeights } from './line-heights';
import { shadows } from './shadows';
import { styles } from './styles';
import { getComponents, getDesignTokens } from './utils';

export const theme = extendTheme({
  config,
  components: getComponents(SNAPS_COMPONENTS),

  fonts: {
    heading: `"Euclid Circular B", sans-serif`,
    body: `"Euclid Circular B", sans-serif`,
  },

  lineHeights,

  semanticTokens: {
    borders,
    colors: getDesignTokens('colors'),
    shadows,
  },

  styles,
});
