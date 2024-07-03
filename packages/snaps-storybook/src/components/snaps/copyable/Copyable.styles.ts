import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    display: 'flex',
    gap: '2',
    justifyContent: 'space-between',
    borderRadius: 'lg',
    padding: '2',
    fontSize: 'sm',
    color: 'text.alternative',
    background: 'background.alternative',
    overflowY: 'hidden',
  }),

  variants: {
    sensitive: defineStyle({
      color: 'error.default',
      background: 'error.muted',
    }),
  },
});
