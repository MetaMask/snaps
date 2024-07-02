import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const Text = defineStyleConfig({
  baseStyle: defineStyle({
    fontSize: 'sm',
    lineHeight: 'short',
  }),
});
