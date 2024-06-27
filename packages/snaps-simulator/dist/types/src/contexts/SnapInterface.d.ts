import { UserInputEventType } from '@metamask/snaps-sdk';
import type { State } from '@metamask/snaps-sdk';
import type { FunctionComponent, ReactNode } from 'react';
export declare type GetValue = (name: string, form?: string) => State | undefined;
export declare type HandleInputChange = (name: string, value: string | null, form?: string) => void;
export declare type HandleEvent = (args: {
    event: UserInputEventType;
    name?: string;
    value?: State;
}) => void;
export declare type SnapInterfaceContextType = {
    getValue: GetValue;
    handleInputChange: HandleInputChange;
    handleEvent: HandleEvent;
};
export declare const SnapInterfaceContext: import("react").Context<SnapInterfaceContextType>;
export declare type SnapInterfaceContextProviderProps = {
    children: ReactNode;
};
/**
 * A provider for the Snap Interface context.
 * This context provides functions to interact with the Snap Interface.
 *
 * @param props - The props of the component.
 * @param props.children - The children of the component.
 * @returns A provider for the Snap Interface context.
 */
export declare const SnapInterfaceContextProvider: FunctionComponent<SnapInterfaceContextProviderProps>;
/**
 * Get the Snap Interface context.
 *
 * @returns The Snap Interface context.
 */
export declare function useSnapInterfaceContext(): SnapInterfaceContextType;
