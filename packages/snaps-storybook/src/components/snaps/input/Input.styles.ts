import { inputAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

export const styles = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    field: {
      color: 'text.default',
      fontSize: 'sm',
      paddingX: '4',
      paddingY: '2',
    },
  }),

  variants: {
    outline: definePartsStyle({
      field: {
        background: 'background.default',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'border.default',
        borderRadius: 'base',
        _focus: {
          outline: '5px auto',
          outlineColor: 'primary.default',
          outlineOffset: '0',
        },
        _placeholder: {
          color: 'text.alternative',
        },
        _invalid: {
          borderColor: 'error.default',
          boxShadow: 'none',
        },
      },
    }),
  },

  defaultProps: {
    variant: 'outline',
  },
});
