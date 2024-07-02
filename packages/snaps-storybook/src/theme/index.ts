import { extendTheme } from '@chakra-ui/react';

import { borders } from './borders';
import * as components from './components';
import { config } from './config';
import { styles } from './styles';
import { getDesignTokens } from './utils';

export const theme = extendTheme({
  config,
  components,

  semanticTokens: {
    borders,
    colors: getDesignTokens('colors'),
  },

  fonts: {
    heading: `"Euclid Circular B", sans-serif`,
    body: `"Euclid Circular B", sans-serif`,
  },

  styles,
});
