import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineRecipe,
} from '@chakra-ui/react';

/**
 * The custom Chakra UI theme configuration.
 */
const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: {
          value:
            '"Centra No1", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        },
      },
    },

    semanticTokens: {
      colors: {
        background: {
          muted: {
            value: '#F3F5F9',
          },
        },

        info: {
          default: {
            value: '#4459FF',
          },
          muted: {
            value: '#4459FF1A',
          },
        },

        text: {
          secondary: {
            value: '#747474',
          },
        },
      },
    },

    recipes: {
      button: defineRecipe({
        base: {
          paddingX: '4',
          paddingY: '3',
        },
      }),

      heading: defineRecipe({
        base: {
          fontFamily: 'heading',
          fontWeight: 'medium',
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
    },
  },
});

/**
 * The Chakra UI system object.
 */
export const system = createSystem(defaultConfig, config);
