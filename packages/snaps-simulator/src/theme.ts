/* eslint-disable @typescript-eslint/naming-convention */

import {
  tagAnatomy,
  formAnatomy,
  tabsAnatomy,
  modalAnatomy,
  switchAnatomy,
} from '@chakra-ui/anatomy';
import type { ThemeConfig } from '@chakra-ui/react';
import {
  createMultiStyleConfigHelpers,
  cssVar,
  defineStyle,
  defineStyleConfig,
  extendTheme,
} from '@chakra-ui/react';

/* eslint-disable @typescript-eslint/unbound-method */
const {
  definePartsStyle: defineTagPartsStyle,
  defineMultiStyleConfig: defineTagMultiStyleConfig,
} = createMultiStyleConfigHelpers(tagAnatomy.keys);

const {
  definePartsStyle: defineFormPartsStyle,
  defineMultiStyleConfig: defineFormMultiStyleConfig,
} = createMultiStyleConfigHelpers(formAnatomy.keys);

const {
  definePartsStyle: defineTabsPartsStyle,
  defineMultiStyleConfig: defineTabsMultiStyleConfig,
} = createMultiStyleConfigHelpers(tabsAnatomy.keys);

const {
  definePartsStyle: defineModalPartsStyle,
  defineMultiStyleConfig: defineModalMultiStyleConfig,
} = createMultiStyleConfigHelpers(modalAnatomy.keys);

const {
  definePartsStyle: defineSwitchPartsStyle,
  defineMultiStyleConfig: defineSwitchMultiStyleConfig,
} = createMultiStyleConfigHelpers(switchAnatomy.keys);
/* eslint-enable @typescript-eslint/unbound-method */

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

export const theme = extendTheme({
  config,

  semanticTokens: {
    colors: {
      'chakra-body-bg': { _light: 'white', _dark: '#24272A' },
      text: {
        default: '#24272A',
        _dark: '#9FA6AE',
        tab: {
          default: '#535A61',
          _dark: '#FFFFFF',
          selected: {
            default: '#24272A',
            _dark: '#FFFFFF',
          },
        },
        console: {
          default: '#535A61',
          _dark: '#D6D9DC',
        },
      },
      background: {
        alternative: { default: '#F5F5F5', _dark: '#1D1F22' },
        hover: {
          default: '#FAFBFC',
          _dark: '#141618',
        },
      },
      info: {
        default: {
          default: '#0376C9',
          _dark: '#1098FC',
        },
        muted: {
          default: 'rgba(3, 118, 201, 0.1)',
          _dark: '#141618',
        },
      },
      border: {
        default: {
          default: '#D6D9DC',
          _dark: '#3B4046',
        },
        active: {
          default: '#24272A',
          _dark: 'rgba(255, 255, 255, 0.06)',
        },
      },
      gray: {
        muted: {
          default: '#D6D9DC',
          _dark: '#3B4046',
        },
      },
    },
    borders: {
      muted: {
        default: '1px solid #D6D9DC',
        _dark: '1px solid #3B4046',
      },
    },
  },

  colors: {
    text: {
      white: '#FFFFFF',
      alternative: '#535A61',
      success: '#579F6E',
      error: '#D34C46',
      muted: '#BBC0C5',
    },
    error: {
      default: '#D34C46',
      muted: 'rgba(215, 56, 71, 0.1)',
    },
    success: {
      default: '#579F6E',
    },
    gray: {
      40: '#F2F4F6',
    },
  },

  components: {
    Container: defineStyleConfig({
      baseStyle: {
        paddingX: 4,
        paddingY: 4,
      },
      sizes: {
        fullWidth: {
          maxWidth: '100%',
        },
      },
    }),

    Divider: defineStyleConfig({
      baseStyle: {
        opacity: 1,
      },
    }),

    Form: defineFormMultiStyleConfig({
      baseStyle: defineFormPartsStyle({
        container: {
          label: {
            fontSize: 'xs',
            marginBottom: 1,
          },
          input: {
            marginBottom: 4,
            borderColor: 'border.default',
            outline: 'none',
            fontSize: 'sm',
            _active: {
              borderColor: 'border.active',
              outline: 'none',
              boxShadow: 'none',
            },
            _focusVisible: {
              borderColor: 'border.active',
              outline: 'none',
              boxShadow: 'none',
            },
          },
          textarea: {
            marginBottom: 4,
            borderColor: 'border.default',
            outline: 'none',
            fontSize: 'sm',
            _active: {
              borderColor: 'border.active',
              outline: 'none',
              boxShadow: 'none',
            },
            _focusVisible: {
              borderColor: 'border.active',
              outline: 'none',
              boxShadow: 'none',
            },
          },
          select: {
            borderColor: 'border.default',
            outline: 'none',
            fontSize: 'sm',
            _active: {
              borderColor: 'border.active',
              outline: 'none',
              boxShadow: 'none',
            },
            _focusVisible: {
              borderColor: 'border.active',
              outline: 'none',
              boxShadow: 'none',
            },
          },
        },
      }),
    }),

    Heading: {
      variants: {
        main: {
          fontFamily: 'custom',
        },
      },
    },

    Link: defineStyleConfig({
      variants: {
        'navigation-active': {
          opacity: '1',
          background: 'background.alternative',
          borderRadius: 'lg',
        },

        'navigation-default': {
          opacity: '0.6',
          borderRadius: 'lg',
        },
      },
    }),

    Tabs: defineTabsMultiStyleConfig({
      variants: {
        line: defineTabsPartsStyle({
          tablist: {
            background: 'background.alternative',
            borderBottom: '1px solid',
            borderColor: 'border.default',
            paddingX: '4',
          },
          tab: {
            color: 'text.tab',
            fontSize: 'xs',
            fontWeight: '600',
            textTransform: 'uppercase',
            outline: 'none',
            paddingTop: '0',
            paddingX: '0',
            paddingBottom: '0.5',
            marginY: '3',
            background: 'none',
            '& + &': {
              marginLeft: '4',
            },
            _selected: {
              color: 'text.tab.selected',
              borderBottom: '2px solid',
              borderColor: 'border.active',
            },
          },
        }),
      },
    }),

    Text: defineStyleConfig({
      baseStyle: {
        color: 'text',
      },
    }),

    Tag: defineTagMultiStyleConfig({
      variants: {
        code: defineTagPartsStyle({
          container: {
            color: 'info.default',
            background: 'info.muted',
            borderRadius: '0px',
            fontWeight: 'normal',
            fontFamily: 'code',
          },
        }),
      },
    }),

    Button: defineStyleConfig({
      variants: {
        solid: defineStyle({
          bg: '#24272A',
          textColor: 'white',
          _hover: {
            bg: '#0376C9',
          },
          _active: {
            bg: '#0376C9',
          },
          fontFamily: 'custom',
        }),
        primary: defineStyle({
          height: '48px',
          borderRadius: '30px',
          background: 'info.default',
          fontSize: 'sm',
          fontWeight: 'normal',
          lineHeight: '157%',
          color: 'white',
          borderColor: 'info.default',
          padding: '3',
          fontFamily: 'custom',
        }),
        outline: defineStyle({
          height: '48px',
          borderRadius: '30px',
          background: 'transparent',
          fontSize: 'sm',
          fontWeight: 'normal',
          lineHeight: '157%',
          color: 'info.default',
          borderColor: 'info.default',
          padding: '3',
          fontFamily: 'custom',
        }),
      },
    }),

    Skeleton: defineStyleConfig({
      baseStyle: defineStyle({
        [cssVar('skeleton-start-color').variable]:
          'colors.background.alternative',
        [cssVar('skeleton-end-color').variable]: 'colors.border',
        borderRadius: 'lg',
      }),
    }),

    Modal: defineModalMultiStyleConfig({
      baseStyle: defineModalPartsStyle({
        dialog: {
          bg: 'chakra-body-bg',
        },
      }),
    }),

    Switch: defineSwitchMultiStyleConfig({
      baseStyle: defineSwitchPartsStyle({
        track: {
          _checked: {
            bg: '#0376C9',
          },
        },
      }),
    }),
  },

  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
    code: `SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace`,
    custom: `"Euclid Circular B", sans-serif`,
  },

  styles: {
    global: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '#root': {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '$100vh',
      },
      iframe: {
        display: 'none',
      },
    },
  },
});
