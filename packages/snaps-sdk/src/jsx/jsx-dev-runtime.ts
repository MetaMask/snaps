import type { JsonObject, Key, SnapComponent } from './component';
import { jsx } from './jsx-runtime';
import { assertJSXElement } from './validation';

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * This is the "development" version of the runtime, which includes additional
 * validation, which is otherwise handled by MetaMask. To use this runtime,
 * specify `@metamask/snaps-sdk` as import source for JSX, and use
 * `react-jsxdev` as the pragma.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @param key - The key of the component.
 * @returns The rendered component.
 * @see https://www.typescriptlang.org/tsconfig/#jsx
 */
export function jsxDEV<Props extends JsonObject>(
  component: SnapComponent<Props>,
  props: Props,
  key: Key | null,
): unknown | null {
  const element = jsx(component, props, key);
  assertJSXElement(element);

  return element;
}
