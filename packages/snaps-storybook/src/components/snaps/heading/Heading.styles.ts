import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    color: 'text.default',
    fontWeight: '700',
  }),

  sizes: {
    md: {
      fontSize: 'md',
      lineHeight: 'base',
    },
  },

  defaultProps: {
    size: 'md',
  },
});
