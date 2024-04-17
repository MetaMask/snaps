import type { JsonObject, Key, SnapComponent } from './component';
import type { BoxProps } from './components';
import { Box } from './components';

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @returns The rendered component.
 */
export function jsx<Props extends JsonObject>(
  component: SnapComponent<Props>,
  props: Props & { key?: Key | null },
): unknown | null {
  if (!component) {
    // If component is undefined, a JSX fragment `<>...</>` was used. In this
    // case, we need to wrap the children in a `Box` component.
    return jsx(Box, props as unknown as BoxProps);
  }

  return component(props);
}

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * The `jsxs` function is used for rendering nested components.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @returns The rendered component.
 */
export function jsxs<Props extends JsonObject>(
  component: SnapComponent<Props>,
  props: Props & { key?: Key | null },
): unknown | null {
  return jsx(component, props);
}
