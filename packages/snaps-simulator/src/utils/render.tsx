import type { RenderResult } from '@testing-library/react';
import { render as testingLibraryRender } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Root } from '../components';
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
