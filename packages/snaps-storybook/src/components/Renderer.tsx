import type { GenericSnapElement, Nestable } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { CUSTOM_COMPONENTS } from './custom';
import { SNAPS_COMPONENTS } from './snaps';

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
};

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

  if (CUSTOM_COMPONENTS[element.type as keyof typeof CUSTOM_COMPONENTS]) {
    const Component =
      CUSTOM_COMPONENTS[element.type as keyof typeof CUSTOM_COMPONENTS];

    // @ts-expect-error - TODO: Fix types.
    return <Component id={id} Renderer={Renderer} {...element.props} />;
  }

  // eslint-disable-next-line import/namespace
  const item = SNAPS_COMPONENTS[element.type];
  assert(item, `No component found for type: "${element.type}".`);

  return <item.Component id={id} Renderer={Renderer} {...element.props} />;
};
