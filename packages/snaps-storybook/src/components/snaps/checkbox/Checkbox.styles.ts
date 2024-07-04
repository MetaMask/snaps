import { checkboxAnatomy, switchAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers, cssVar } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(checkboxAnatomy.keys);

const {
  definePartsStyle: defineSwitchPartsStyle,
  defineMultiStyleConfig: defineSwitchMultiStyleConfig,
} = createMultiStyleConfigHelpers(switchAnatomy.keys);

const width = cssVar('switch-track-width');
const height = cssVar('switch-track-height');

export const styles = {
  Checkbox: defineMultiStyleConfig({
    baseStyle: definePartsStyle({
      control: {
        borderColor: 'border.default',
        borderRadius: 'base',

        _hover: {
          background: 'background.defaultHover',
          color: 'background.defaultHover',
        },

        _focus: {
          borderColor: 'primary.default',
        },

        _checked: {
          background: 'primary.default',
          borderColor: 'primary.default',
          _hover: {
            background: 'primary.alternative',
            borderColor: 'primary.alternative',
          },
        },
      },

      label: {
        fontSize: 'sm',
      },
    }),

    sizes: {
      md: definePartsStyle({
        control: {
          width: '20px',
          height: '20px',
        },

        label: {
          fontSize: 'sm',
        },
      }),
    },

    defaultProps: {
      size: 'md',
    },
  }),

  Switch: defineSwitchMultiStyleConfig({
    baseStyle: defineSwitchPartsStyle({
      container: {
        display: 'flex',
        alignItems: 'center',
      },

      track: {
        _checked: {
          background: 'primary.default',
        },
      },
    }),

    sizes: {
      md: defineSwitchPartsStyle({
        container: {
          [width.variable]: '32px',
          [height.variable]: '18px',
        },

        track: {
          padding: '1',
        },

        thumb: {
          width: '18px',
          height: '18px',
        },

        label: {
          fontSize: 'sm',
        },
      }),
    },

    defaultProps: {
      size: 'md',
    },
  }),
};
