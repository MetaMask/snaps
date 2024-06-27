import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
declare type RendererProps = {
    content: JSXElement;
};
/**
 * A UI renderer for Snaps UI.
 *
 * @param props - The component props.
 * @param props.content - The JSX element to render.
 * @returns The renderer component.
 */
export declare const Renderer: FunctionComponent<RendererProps>;
export {};
