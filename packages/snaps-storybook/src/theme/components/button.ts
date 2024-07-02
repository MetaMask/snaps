/* eslint-disable @typescript-eslint/naming-convention */

import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const Button = defineStyleConfig({
  baseStyle: defineStyle({
    background: 'none',
    maxWidth: 'fit-content',
    _disabled: {
      opacity: 1,
    },
  }),

  variants: {
    primary: defineStyle({
      color: 'info.default',
      _disabled: {
        color: 'text.muted',
      },
    }),

    destructive: defineStyle({
      color: 'error.default',
      _disabled: {
        color: 'text.muted',
      },
    }),
  },

  sizes: {
    text: defineStyle({
      lineHeight: 'short',
      fontSize: 'sm',
      fontWeight: '500',
      margin: 0,
      padding: 0,
      paddingInlineStart: 0,
      paddingInlineEnd: 0,
    }),
  },

  defaultProps: {
    variant: 'primary',
    size: 'text',
  },
});
