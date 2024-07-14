import type { GenericSnapElement } from '@metamask/snaps-sdk/jsx';

import type { Decorator } from './types';

/**
 * Wrap the story in a `ThemeProvider` with the theme from the global context.
 *
 * @param storyFn - The story function.
 * @param context - The context.
 * @returns The decorated story.
 */
const withThemeProvider: Decorator = (storyFn, context) => {
  const element = storyFn() as GenericSnapElement;
  const { theme } = context.globals;

  return {
    type: 'ThemeProvider',
    props: {
      children: element,
      theme,
    },
    key: null,
  };
};

/**
 * Wrap the story in the extension frame if the `extension` global is set.
 *
 * @param storyFn - The story function.
 * @param context - The context.
 * @returns The decorated story.
 */
const withExtension: Decorator = (storyFn, context) => {
  const element = storyFn() as GenericSnapElement;

  if (context.globals.extension && element.type !== 'Extension') {
    return {
      type: 'Extension',
      props: {
        children: element,
      },
      key: null,
    };
  }

  return element;
};

// Note: The order here is important. The first decorator in the array is the
// innermost decorator. The last decorator in the array is the outermost
// decorator.
export const decorators: Decorator[] = [withExtension, withThemeProvider];
