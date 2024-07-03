/* eslint-disable @typescript-eslint/naming-convention */

import type { defineStyleConfig } from '@chakra-ui/styled-system';
import type { Theme } from '@metamask/design-tokens';
import { darkTheme, lightTheme } from '@metamask/design-tokens';

import type { Component } from '../components';

export type DesignTokens = Record<
  string,
  Record<string, { default: string; _dark: string }>
>;

/**
 * Create a Chakra-compatible design tokens object from the design tokens
 * provided by the `@metamask/design-tokens` package.
 *
 * @param themeValue - The theme value to extract from the design tokens.
 * @returns The design tokens for the specified theme value.
 */
export function getDesignTokens(themeValue: keyof Theme): DesignTokens {
  return Object.fromEntries(
    Object.entries(lightTheme[themeValue]).map(([themeKey, themeObject]) => [
      themeKey,
      Object.fromEntries(
        Object.entries(themeObject).map(([key, value]) => [
          key,
          {
            default: value as string,
            _dark:
              darkTheme[themeValue][themeKey as keyof Theme[typeof themeValue]][
                key
              ],
          },
        ]),
      ),
    ]),
  );
}

export type Styles = ReturnType<typeof defineStyleConfig>;

/**
 * Extract the styles from the components provided.
 *
 * @param components - The components to extract styles from.
 * @returns The styles extracted from the components.
 */
export function getComponents(components: Record<string, Component>) {
  return Object.fromEntries(
    Object.entries(components)
      .filter(([, component]) => component.styles !== undefined)
      .map(([componentName, component]) => [
        componentName,
        component.styles as Styles,
      ]),
  );
}
