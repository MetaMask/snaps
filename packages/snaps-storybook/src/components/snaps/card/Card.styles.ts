import { cardAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

export const styles = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    container: {
      gap: '2',
    },

    header: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '2',
      padding: '0',
      color: 'text.default',
      fontSize: 'sm',
      fontWeight: '500',
    },

    body: {
      padding: '0',
      color: 'text.alternative',
      fontSize: 'sm',
    },
  }),

  variants: {
    clear: definePartsStyle({
      container: {
        background: 'transparent',
        boxShadow: 'none',
      },
    }),
  },

  defaultProps: {
    variant: 'clear',
  },
});
