import type { Styles } from '@chakra-ui/theme-tools';

export const styles: Styles = {
  global: {
    body: {
      background: 'background.default',
      color: 'text.default',
      fontSize: 'sm',
    },

    // The Storybook docs container.
    '.docs-story': {
      background: 'background.default',
      color: 'text.default',
    },
  },
};
