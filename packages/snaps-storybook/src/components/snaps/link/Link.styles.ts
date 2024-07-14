import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    color: 'primary.default',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
  }),
});
