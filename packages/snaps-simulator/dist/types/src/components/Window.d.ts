import type { FunctionComponent, ReactNode } from 'react';
declare type WindowProps = {
    snapName: string;
    snapId: string;
    children: ReactNode;
    showAuthorship?: boolean;
};
/**
 * A MetaMask-like window, with a snap authorship pill.
 *
 * @param props - The props.
 * @param props.snapName - The name of the snap.
 * @param props.snapId - The ID of the snap.
 * @param props.children - The children to render inside the window.
 * @param props.showAuthorship - Show the authorship component.
 * @returns The window component.
 */
export declare const Window: FunctionComponent<WindowProps>;
export {};
