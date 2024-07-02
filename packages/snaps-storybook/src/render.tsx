import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { renderElement, unmountElement } from '@storybook/react-dom-shim';
import type { ArgsStoryFn, RenderToCanvas } from '@storybook/types';
import { StrictMode } from 'react';

import { ErrorBoundary, Renderer } from './components';
import type { SnapsRenderer } from './types';

/**
 * Render a story.
 *
 * @param args - The story arguments.
 * @param context - The story context.
 * @returns The rendered story.
 */
export const render: ArgsStoryFn<SnapsRenderer> = (args, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`,
    );
  }

  return <Component {...args} />;
};

/**
 * Render a story to a "canvas" (i.e., a DOM element, not a literal canvas).
 * This renders `@metamask/snaps-sdk` JSX elements to the DOM, by creating a
 * React root and rendering a template renderer which renders the JSX elements
 * to the DOM.
 *
 * @param context - The context of the story.
 * @param context.storyFn - The story function.
 * @param context.showMain - A function that displays the main view.
 * @param context.showException - A function that displays an exception.
 * @param context.forceRemount - Whether to force remount the component.
 * @param canvas - The DOM element to render the story to.
 * @returns A cleanup function.
 */
export const renderToCanvas: RenderToCanvas<SnapsRenderer> = async (
  { storyFn, showMain, showException, forceRemount },
  canvas,
) => {
  const storyElement = storyFn() as JSXElement;

  const element = (
    <StrictMode>
      <ErrorBoundary showMain={showMain} showException={showException}>
        <Renderer id="root" element={storyElement} />
      </ErrorBoundary>
    </StrictMode>
  );

  if (forceRemount) {
    unmountElement(canvas);
  }

  // We render the element using `@storybook/react-dom-shim`, since it handles
  // multiple renderers and contexts.
  await renderElement(element, canvas);

  return () => {
    unmountElement(canvas);
  };
};
