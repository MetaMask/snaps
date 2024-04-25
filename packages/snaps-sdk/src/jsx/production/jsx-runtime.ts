import type { JsonObject, Key, SnapComponent } from '../component';

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * This is the "production" version of the runtime, which does not include
 * additional validation, as it is handled by MetaMask. To use this runtime,
 * specify `@metamask/snaps-sdk/production` as import source for JSX.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @returns The rendered component.
 */
export function jsx<Props extends JsonObject>(
  component: SnapComponent<Props>,
  props: Props & { key?: Key | null },
): unknown | null {
  if (typeof component === 'string') {
    // If component is a string, it is a built-in HTML element. This is not
    // supported in Snaps, so we throw an error.
    throw new Error(
      `An HTML element ("${String(
        component,
      )}") was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.`,
    );
  }

  if (!component) {
    // If component is undefined, a JSX fragment `<>...</>` was used, which is
    // not supported in Snaps.
    throw new Error(
      'A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.',
    );
  }

  return component(props);
}

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * The `jsxs` function is used for rendering nested components.
 *
 * This is the "production" version of the runtime, which does not include
 * additional validation, as it is handled by MetaMask. To use this runtime,
 * specify `@metamask/snaps-sdk/production` as import source for JSX.
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
