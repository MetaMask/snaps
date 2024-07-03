import type { GenericSnapElement, Nestable } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { CUSTOM_COMPONENTS } from './custom';
import { SNAPS_COMPONENTS } from './snaps';

/**
 * Custom component overrides.
 */
export type Overrides = Record<string, FunctionComponent<RenderProps<any>>>;

/**
 * The props that are passed to a rendered component.
 *
 * @template Type - The type of the props of the component itself. These will be
 * merged with the render props.
 */
export type RenderProps<Type> = Type & {
  /**
   * The Renderer component to use to render nested elements.
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Renderer: FunctionComponent<RendererProps>;
};

/**
 * The props for the {@link Renderer} component.
 */
export type RendererProps = {
  /**
   * The unique ID to use as key for the renderer. This is used to ensure that
   * the rendered components have unique keys.
   */
  id: string;

  /**
   * The JSX element to render.
   */
  element: Nestable<string | GenericSnapElement | boolean | null>;

  /**
   * Custom component overrides.
   */
  overrides?: Overrides;
};

/**
 * Get the components to use for rendering JSX elements.
 *
 * @param overrides - Custom component overrides.
 * @returns The components to use for rendering JSX elements.
 */
function getComponents(
  overrides: Overrides,
): Record<string, FunctionComponent<RenderProps<any>>> {
  const snapsComponents = Object.fromEntries(
    Object.entries(SNAPS_COMPONENTS).map(([key, value]) => [
      key,
      value.Component,
    ]),
  );

  return {
    ...CUSTOM_COMPONENTS,
    ...snapsComponents,
    ...overrides,
  };
}

/**
 * The renderer component that renders Snaps JSX elements. It supports rendering
 * strings, JSX elements, booleans, null, and arrays thereof.
 *
 * @param props - The component props.
 * @param props.id - The unique ID to use as key for the renderer. This is used
 * to ensure that the rendered components have unique keys.
 * @param props.element - The JSX element to render.
 * @param props.overrides - Custom component overrides.
 * @returns The rendered component.
 */
export const Renderer: FunctionComponent<RendererProps> = ({
  element,
  id,
  overrides = {},
}) => {
  const components = getComponents(overrides);

  if (typeof element === 'string') {
    return <>{element}</>;
  }

  if (element === null || typeof element === 'boolean') {
    return null;
  }

  if (Array.isArray(element)) {
    return (
      <>
        {element.map((child, index) => (
          <Renderer
            id={`${id}-${index}`}
            key={`${id}-${index}`}
            element={child}
            overrides={overrides}
          />
        ))}
      </>
    );
  }

  const Component = components[element.type];
  assert(Component, `No component found for type: "${element.type}".`);

  return (
    <Component
      id={id}
      Renderer={createRenderer(id, overrides)}
      {...element.props}
    />
  );
};

/**
 * Create a renderer component that renders JSX elements with the given base ID
 * and overrides.
 *
 * @param baseId - The base ID to use for the renderer.
 * @param baseOverrides - The base custom component overrides.
 * @returns The renderer component.
 */
function createRenderer(baseId: string, baseOverrides: Overrides) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  return function ChildRenderer({ id, element, overrides }: RendererProps) {
    return (
      <Renderer
        element={element}
        id={`${baseId}-${id}`}
        overrides={{
          ...baseOverrides,
          ...overrides,
        }}
      />
    );
  };
}
