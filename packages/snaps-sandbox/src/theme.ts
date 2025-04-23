/* eslint-disable @typescript-eslint/naming-convention */

import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
  defineTokens,
} from '@chakra-ui/react';

const tokens = defineTokens({
  colors: {
    grey: {
      0: {
        value: '#ffffff',
      },
      50: {
        value: '#f3f5f9',
      },
      100: {
        value: '#dadce5',
      },
      200: {
        value: '#b7bbc8',
      },
      300: {
        value: '#9ca1af',
      },
      400: {
        value: '#858b9a',
      },
      500: {
        value: '#686e7d',
      },
      600: {
        value: '#4b505c',
      },
      700: {
        value: '#31333a',
      },
      800: {
        value: '#222325',
      },
      900: {
        value: '#121314',
      },
      1000: {
        value: '#000000',
      },
    },

    blue: {
      25: {
        value: '#f8f9ff',
      },
      50: {
        value: '#f4f5ff',
      },
      100: {
        value: '#d6dbff',
      },
      200: {
        value: '#adb6fe',
      },
      300: {
        value: '#8b99ff',
      },
      400: {
        value: '#6f7eff',
      },
      500: {
        value: '#4459ff',
      },
      600: {
        value: '#2c3dc5',
      },
      700: {
        value: '#1c277f',
      },
      800: {
        value: '#131b59',
      },
      900: {
        value: '#0b0f32',
      },
    },
  },

  fonts: {
    body: {
      value:
        '"Centra No1", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
  },
});

/**
 * The custom Chakra UI theme configuration.
 */
const config = defineConfig({
  theme: {
    tokens,

    semanticTokens: {
      colors: {
        background: {
          muted: {
            value: '#F3F5F9',
          },
        },

        info: {
          default: {
            value: 'colors.blue.500',
          },
          muted: {
            value: '#4459ff1a',
          },
          inverse: {
            value: 'colors.grey.0',
          },
        },

        text: {
          primary: {
            value: 'colors.grey.900',
          },
          secondary: {
            value: '#747474',
          },
          alternative: {
            value: 'colors.grey.500',
          },
        },
      },
    },

    recipes: {
      button: defineRecipe({
        variants: {
          colorScheme: {
            info: {
              color: 'info.default',
              background: 'info.muted',
              _hover: {
                background: 'info.default',
                color: 'white',
              },
            },
          },

          size: {
            md: {
              fontSize: 'md',
              height: 'auto',
              paddingX: '2',
              paddingY: '1',
            },
          },
        },
      }),

      heading: defineRecipe({
        base: {
          fontFamily: 'heading',
          fontWeight: '600',
        },

        variants: {
          as: {
            h1: {
              fontFamily:
                '"MM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
            },
          },
        },
      }),

      text: defineRecipe({
        variants: {
          variant: {
            default: {
              color: 'text.primary',
            },

            muted: {
              fontWeight: '400',
              color: 'text.secondary',
            },
          },
        },

        defaultVariants: {
          variant: 'default',
        },
      }),
    },
  },
});

/**
 * The Chakra UI system object.
 */
export const system = createSystem(defaultConfig, config);
