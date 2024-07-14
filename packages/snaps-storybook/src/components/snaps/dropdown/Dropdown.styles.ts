import { selectAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(selectAnatomy.keys);

export const styles = {
  Select: defineMultiStyleConfig({
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
          border: '1px solid',
          borderColor: 'border.default',
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
  }),

  defaultProps: {
    variant: 'outline',
  },
};
