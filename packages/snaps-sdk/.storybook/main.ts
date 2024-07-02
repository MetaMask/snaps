import { StorybookConfig } from '@storybook/types';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx', '../src/**/*.mdx'],
  framework: {
    name: '@metamask/snaps-storybook',
    options: {},
  },
  addons: [
    '@storybook/addon-controls',
  ],
  core: {
    disableTelemetry: true,
  }
};

export default config;
