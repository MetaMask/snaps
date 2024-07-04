import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

export const styles = defineStyleConfig({
  baseStyle: defineStyle({
    cursor: 'pointer',
    background: 'background.alternative',
    borderRadius: 'lg',
    border: '1px solid',
    borderColor: 'border.default',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '4',
    gap: '1',
    textAlign: 'center',
    color: 'icon.alternative',
    fontWeight: '500',

    _active: {
      backgroundColor: 'background.alternativeHover',
      color: 'primary.default',
    },

    _selected: {
      color: 'text.default',
    },
  }),

  variants: {
    compact: {
      width: 'fit-content',
      height: 'fit-content',
      padding: '1',

      _selected: {
        color: 'icon.alternative',
      },
    },
  },
});
