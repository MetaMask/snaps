import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    display: 'flex',
    gap: '1',
    justifyContent: 'space-between',
    borderRadius: 'lg',
    paddingY: 'px',
  }),

  variants: {
    default: defineStyle({
      flexDirection: 'row',
    }),

    warning: defineStyle({
      color: 'warning.default',
      background: 'warning.muted',
      paddingX: '2',
    }),

    critical: defineStyle({
      color: 'error.default',
      background: 'error.muted',
      paddingX: '2',
    }),
  },
});
