import { cssVar, defineStyle, defineStyleConfig } from '@chakra-ui/react';

const background = cssVar('popper-arrow-bg');

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    background: 'background.default',
    color: 'text.default',
    boxShadow: 'md',
    [background.variable]: 'colors.background.default',
  }),

  sizes: {
    sm: defineStyle({
      fontSize: 'xs',
      fontWeight: 'normal',
      lineHeight: 'short',
    }),
  },

  defaultProps: {
    size: 'sm',
  },
});
