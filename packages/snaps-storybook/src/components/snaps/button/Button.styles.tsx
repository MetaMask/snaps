/* eslint-disable @typescript-eslint/naming-convention */

import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    background: 'none',
    borderRadius: '0',
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

    solid: defineStyle({
      color: 'background.default',
      backgroundColor: 'text.default',
      _disabled: {
        backgroundColor: 'text.muted',
      },

      _hover: {
        backgroundColor: 'text.alternative',
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

    large: defineStyle({
      lineHeight: 'short',
      fontSize: 'sm',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingX: '4',
      height: '48px',
      borderRadius: 'full',
      border: '1px solid',
      borderColor: 'currentColor',
    }),
  },

  defaultProps: {
    variant: 'primary',
    size: 'text',
  },
});
