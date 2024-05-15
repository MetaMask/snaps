import type { JSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import type { RenderResult } from '@testing-library/react';
import { render as testingLibraryRender } from '@testing-library/react';
import { unescape as unescapeEntities } from 'he';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Root } from '../components';
import { Renderer } from '../features/renderer';
import { createStore } from '../store';

/**
 * Render a component for testing. This function wraps the component in a
 * `Root` component, which provides the component with the same context that
 * it would have in the app.
 *
 * @param component - The component to render.
 * @param route - The route to render the component at. Defaults to `/`.
 * @returns The rendered component.
 */
export function render(component: ReactElement, route = '/'): RenderResult {
  const store = createStore();
  return testingLibraryRender(component, {
    wrapper: ({ children }) => (
      <Root store={store}>
        <MemoryRouter initialEntries={[route]} initialIndex={0}>
          {children}
        </MemoryRouter>
      </Root>
    ),
  });
}

/**
 * Render text based children of a JSX element.
 *
 * @param node - The JSX element to render.
 * @param id - The ID of the element.
 * @returns The rendered text children.
 */
export function renderTextChildren(node: (string | JSXElement)[], id: string) {
  return node.map((child, index) => {
    if (typeof child === 'string') {
      return unescapeEntities(child);
    }

    return (
      <Renderer
        key={`${id}-text-child-${index}`}
        id={`${id}-text-child-${index}`}
        node={child}
      />
    );
  });
}
