import type { JsonObject, Key, SnapComponent } from './component';
import { jsx as render } from './production';
import { assertJSXElement } from './validation';

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * This is the "development" version of the runtime, which includes additional
 * validation, which is otherwise handled by MetaMask. To use this runtime,
 * specify `@metamask/snaps-sdk` as import source for JSX.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @returns The rendered component.
 */
export function jsx<Props extends JsonObject>(
  component: SnapComponent<Props>,
  props: Props & { key?: Key | null },
): unknown | null {
  const element = render(component, props);
  assertJSXElement(element);

  return element;
}

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * The `jsxs` function is used for rendering nested components.
 *
 * This is the "development" version of the runtime, which includes additional
 * validation, which is otherwise handled by MetaMask. To use this runtime,
 * specify `@metamask/snaps-sdk` as import source for JSX.
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

// Alias the `jsx` and `jsxs` functions to `jsxDEV` and `jsxsDEV` respectively.
// This is done to ensure that the JSX runtime is compatible with development
// tools that expect these functions to be defined.
export const jsxDEV = jsx;
export const jsxsDEV = jsxs;
