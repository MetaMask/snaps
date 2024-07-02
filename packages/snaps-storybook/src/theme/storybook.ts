import { colors as tokens } from '@metamask/design-tokens';
import { create } from '@storybook/theming';

const colors = tokens.light;

/**
 * The theme for the Storybook UI itself.
 */
export const theme = create(
  {
    brandTitle: 'MetaMask Snaps Storybook',
    brandUrl: 'https://metamask.io',
    brandImage: './snaps/logo.svg',
    brandTarget: '_self',

    base: 'light',

    // Storybook-specific color palette
    colorPrimary: colors.primary.default,
    colorSecondary: colors.primary.alternative,

    // UI
    appBg: colors.background.alternative,
    appContentBg: colors.background.default,
    appPreviewBg: colors.background.default,
    appBorderColor: colors.border.muted,
    appBorderRadius: 4,

    // Fonts
    fontBase: '"Inter", sans-serif',
    fontCode: '"IBM Plex Mono", monospace',

    // Text colors
    textColor: colors.text.default,
    textInverseColor: colors.background.default,
    textMutedColor: colors.text.muted,

    // Toolbar default and active colors
    barTextColor: colors.text.alternative,
    barHoverColor: colors.info.default,
    barSelectedColor: colors.info.default,
    barBg: colors.background.default,

    // Form colors
    buttonBg: colors.primary.muted,
    buttonBorder: colors.primary.muted,
    booleanBg: colors.background.alternativePressed,
    booleanSelectedBg: colors.background.alternativePressed,
    inputBg: colors.background.default,
    inputBorder: colors.border.muted,
    inputTextColor: colors.text.default,
    inputBorderRadius: 4,
  },
  {
    background: {
      content: '#fff',
    },
  },
);
