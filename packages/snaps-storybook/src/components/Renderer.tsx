import type { GenericSnapElement, Nestable } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import * as COMPONENT_MAP from './snaps';

/**
 * The props that are passed to a rendered component.
 *
 * @template Type - The type of the props of the component itself. These will be
 * merged with the render props.
 */
export type RenderProps<Type> = Type & {
  /**
   * The unique ID to use as key for the renderer. This is used to ensure that
   * the rendered components have unique keys.
   */
  id: string;
};

/**
 * The props for the {@link Renderer} component.
 */
export type RendererProps = RenderProps<{
  /**
   * The JSX element to render.
   */
  element: Nestable<string | GenericSnapElement | boolean | null>;
}>;

/**
 * The renderer component that renders Snaps JSX elements. It supports rendering
 * strings, JSX elements, booleans, null, and arrays thereof.
 *
 * @param props - The component props.
 * @param props.id - The unique ID to use as key for the renderer. This is used
 * to ensure that the rendered components have unique keys.
 * @param props.element - The JSX element to render.
 * @returns The rendered component.
 */
export const Renderer: FunctionComponent<RendererProps> = ({ element, id }) => {
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
          />
        ))}
      </>
    );
  }

  // eslint-disable-next-line import/namespace
  const Component = COMPONENT_MAP[element.type as keyof typeof COMPONENT_MAP];
  assert(Component, `No component found for type: "${element.type}".`);

  // @ts-expect-error - TODO: Fix types.
  return <Component id={id} {...element.props} />;
};
