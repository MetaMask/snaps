/* eslint-disable @typescript-eslint/naming-convention */

import type { Theme } from '@metamask/design-tokens';
import { darkTheme, lightTheme } from '@metamask/design-tokens';

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
