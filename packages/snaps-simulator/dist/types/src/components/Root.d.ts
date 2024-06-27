import type { FunctionComponent, ReactElement } from 'react';
import type { createStore } from '../store';
export declare type RootProps = {
    store: ReturnType<typeof createStore>;
    children: ReactElement;
};
/**
 * Render the root component. This is the top-level component that wraps the
 * entire application.
 *
 * @param props - The props.
 * @param props.store - The Redux store.
 * @param props.children - The children to render.
 * @returns The root component.
 */
export declare const Root: FunctionComponent<RootProps>;
