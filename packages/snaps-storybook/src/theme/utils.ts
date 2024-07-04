/* eslint-disable @typescript-eslint/naming-convention */

import type {
  createMultiStyleConfigHelpers,
  defineStyleConfig,
} from '@chakra-ui/react';
import type { Theme } from '@metamask/design-tokens';
import { darkTheme, lightTheme } from '@metamask/design-tokens';
import { hasProperty } from '@metamask/utils';

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

/**
 * The shadow shape type from `@metamask/design-tokens`. It's not exported from
 * the package, so we need to define it here.
 */
type ShadowShape = Theme['shadows']['size']['xs'];

/**
 * Get a shadow string from a {@link ShadowShape} object.
 *
 * @param shape - The shadow shape to get the string for.
 * @returns The shadow string.
 */
function getShadow(shape: ShadowShape) {
  return `${shape.shadowOffset.width}px ${shape.shadowOffset.height}px ${shape.shadowRadius}px 0px ${shape.shadowColor}`;
}

/**
 * Get the shadows from the design tokens.
 *
 * @returns The shadows extracted from the design tokens.
 */
export function getShadows() {
  return Object.fromEntries(
    Object.entries(lightTheme.shadows.size).map(([key, value]) => [
      key,
      {
        default: getShadow(value),
        _dark: getShadow(
          darkTheme.shadows.size[key as keyof Theme['shadows']['size']],
        ),
      },
    ]),
  );
}

export type MultiStyles = ReturnType<
  ReturnType<typeof createMultiStyleConfigHelpers>['defineMultiStyleConfig']
>;

export type Styles = ReturnType<typeof defineStyleConfig>;

/**
 * Check if the styles provided are a record of styles.
 *
 * @param styles - The styles to check.
 * @returns Whether the styles are a record of styles.
 */
export function isStylesRecord(
  styles?: Styles | MultiStyles | Record<string, Styles | MultiStyles>,
): styles is Record<string, Styles | MultiStyles> {
  return (
    styles !== undefined &&
    !hasProperty(styles, 'baseStyle') &&
    !hasProperty(styles, 'variants')
  );
}

/**
 * Extract the styles from the components provided.
 *
 * @param components - The components to extract styles from.
 * @returns The styles extracted from the components.
 */
export function getComponents(components: Record<string, Component>) {
  return Object.entries(components)
    .filter(([, component]) => component.styles !== undefined)
    .reduce((accumulator, [componentName, component]) => {
      if (isStylesRecord(component.styles)) {
        return {
          ...accumulator,
          ...component.styles,
        };
      }

      return {
        ...accumulator,
        [componentName]: component.styles,
      };
    }, {});
}
