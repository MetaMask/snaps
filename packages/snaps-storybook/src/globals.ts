import type { GlobalTypes, Parameters, StoryContext } from '@storybook/types';

import { getSourceCode } from './docs';
import { theme } from './theme/storybook';
import type { SnapsRenderer } from './types';

/**
 * Global types for the Storybook stories. This is mainly used to configure the
 * toolbar.
 *
 * These types are automatically added to the toolbar by
 * `@storybook/addon-toolbars`, which is loaded by this preset.
 */
export const globalTypes: GlobalTypes = {
  extension: {
    name: 'Extension',
    description: 'Toggle the MetaMask extension window',
    defaultValue: false,
    toolbar: {
      icon: 'browser',
      items: [
        {
          value: true,
          title: 'Enable MetaMask',
        },
        {
          value: false,
          title: 'Disable MetaMask',
        },
      ],
      dynamicTitle: true,
    },
  },
  theme: {
    name: 'Theme',
    description: 'The theme of the UI',
    defaultValue: 'light',
    toolbar: {
      icon: 'mirror',
      items: [
        {
          value: 'light',
          right: '🌞',
          title: 'Light theme',
        },
        {
          value: 'dark',
          right: '🌚',
          title: 'Dark theme',
        },
      ],
      dynamicTitle: true,
    },
  },
};

/**
 * The parameters for the Storybook stories. This is mainly used to configure
 * the documentation generation.
 */
export const parameters: Parameters = {
  docs: {
    story: { inline: true },
    source: {
      transform: (
        code: string,
        _context: StoryContext<SnapsRenderer, Record<string, never>>,
      ) => {
        return getSourceCode(code);
      },
    },
    theme,
  },
};
