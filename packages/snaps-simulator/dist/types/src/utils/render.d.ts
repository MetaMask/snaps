import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
/**
 * Render a component for testing. This function wraps the component in a
 * `Root` component, which provides the component with the same context that
 * it would have in the app.
 *
 * @param component - The component to render.
 * @param route - The route to render the component at. Defaults to `/`.
 * @returns The rendered component.
 */
export declare function render(component: ReactElement, route?: string): RenderResult;
/**
 * Render text based children of a JSX element.
 *
 * @param node - The JSX element to render.
 * @param id - The ID of the element.
 * @returns The rendered text children.
 */
export declare function renderTextChildren(node: (string | JSXElement)[], id: string): (string | JSX.Element)[];
/**
 * Generate a React key to be used for a Snap UI component.
 *
 * This function also handles collisions between duplicate keys.
 *
 * @param map - A map of previously used keys to be used for collision handling.
 * @param component - The component.
 * @returns A key.
 */
export declare function generateKey(map: Record<string, number>, component: JSXElement): string;
