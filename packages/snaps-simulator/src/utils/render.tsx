import type { GenericSnapElement, JSXElement } from '@metamask/snaps-sdk/jsx';
import { hasChildren } from '@metamask/snaps-utils';
import { bytesToHex, remove0x } from '@metamask/utils';
import { sha256 } from '@noble/hashes/sha256';
import type { RenderResult } from '@testing-library/react';
import { render as testingLibraryRender } from '@testing-library/react';
import { unescape as unescapeEntities } from 'he';
import memoize from 'lodash.memoize';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Root } from '../components';
import { SnapComponent } from '../features/renderer';
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
      <SnapComponent
        key={`${id}-text-child-${index}`}
        id={`${id}-text-child-${index}`}
        node={child}
      />
    );
  });
}

/**
 * Get a truncated version of component children to use in a hash.
 *
 * @param component - The component.
 * @returns A truncated version of component children to use in a hash.
 */
function getChildrenForHash(component: JSXElement) {
  if (!hasChildren(component)) {
    return null;
  }

  const { children } = component.props;

  if (typeof children === 'string') {
    // For the hash we reduce long strings
    return children.slice(0, 5000);
  }

  if (Array.isArray(children)) {
    // For arrays of children we just use the types
    return (children as GenericSnapElement[]).map((child) => ({
      type: child?.type ?? null,
    }));
  }

  return children;
}

/**
 * A memoized function for generating a hash that represents a Snap UI component.
 *
 * This can be used to generate React keys for components.
 *
 * @param component - The component.
 * @returns A hash as a string.
 */
const generateHash = memoize((component: JSXElement) => {
  const { type, props } = component;
  const { name } = props as { name?: string };
  const children = getChildrenForHash(component);
  return remove0x(
    bytesToHex(
      sha256(
        JSON.stringify({
          type,
          name: name ?? null,
          children,
        }),
      ),
    ),
  );
});

/**
 * Generate a React key to be used for a Snap UI component.
 *
 * This function also handles collisions between duplicate keys.
 *
 * @param map - A map of previously used keys to be used for collision handling.
 * @param component - The component.
 * @returns A key.
 */
export function generateKey(
  map: Record<string, number>,
  component: JSXElement,
): string {
  const hash = generateHash(component);
  const count = (map[hash] ?? 0) + 1;
  map[hash] = count;
  return `${hash}_${count}`;
}
