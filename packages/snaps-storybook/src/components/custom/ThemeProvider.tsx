import { ChakraProvider } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { DecoratorHelpers } from '@storybook/addon-themes';
import type { FunctionComponent } from 'react';

import { theme } from '../../theme';
import { ColorMode } from '../ColorMode';
import { Renderer } from '../Renderer';

const { initializeThemeState } = DecoratorHelpers;

/**
 * The props for the {@link ThemeProvider} component.
 */
export type ThemeProviderProps = {
  /**
   * The JSX element to render.
   */
  children: JSXElement;

  /**
   * The theme to use.
   */
  theme: 'light' | 'dark';
};

/**
 * The theme provider component. This provides the theme values to Chakra UI.
 *
 * @param props - The theme provider props.
 * @param props.children - The JSX element to render.
 * @param props.theme - The theme to use.
 * @returns The rendered theme provider.
 */
export const ThemeProvider: FunctionComponent<ThemeProviderProps> = ({
  children,
  theme: selectedTheme,
}) => {
  initializeThemeState(['light', 'dark'], 'light');

  return (
    <ChakraProvider theme={theme}>
      <ColorMode colorMode={selectedTheme} />
      <Renderer id="provider" element={children} />
    </ChakraProvider>
  );
};
