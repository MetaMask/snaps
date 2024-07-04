import { formAnatomy, formErrorAnatomy } from '@chakra-ui/anatomy';
import {
  createMultiStyleConfigHelpers,
  defineStyleConfig,
} from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(formAnatomy.keys);

const {
  definePartsStyle: defineErrorPartsStyle,
  defineMultiStyleConfig: defineErrorMultiStyleConfig,
} = createMultiStyleConfigHelpers(formErrorAnatomy.keys);

export const styles = {
  FormControl: defineMultiStyleConfig({
    baseStyle: definePartsStyle({
      helperText: {
        color: 'error.default',
        marginTop: '1',
        fontSize: '2xs',
      },
    }),
  }),

  FormError: defineErrorMultiStyleConfig({
    baseStyle: defineErrorPartsStyle({
      text: {
        color: 'error.default',
        fontSize: '2xs',
        marginTop: '1',
      },
    }),
  }),

  FormLabel: defineStyleConfig({
    baseStyle: {
      color: 'text.default',
      fontSize: 'sm',
      marginBottom: '0',
    },
  }),
};
