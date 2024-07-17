import type { DialogApprovalTypes } from '@metamask/snaps-rpc-methods';
import type { InterfaceState, SnapId, File } from '@metamask/snaps-sdk';
import { DialogType } from '@metamask/snaps-sdk';
import { type JSXElement } from '@metamask/snaps-sdk/jsx';
import { type SagaIterator } from 'redux-saga';
import type { FileOptions, SnapInterface, SnapInterfaceActions } from '../../types';
import type { RootControllerMessenger } from './controllers';
import type { Interface, RunSagaFunction } from './store';
/**
 * Get a user interface object from a type and content object.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @param type - The type of the interface.
 * @param content - The content to show in the interface.
 * @param interfaceActions - The actions to interact with the interface.
 * @returns The user interface object.
 */
export declare function getInterfaceResponse(runSaga: RunSagaFunction, type: DialogApprovalTypes[DialogType | 'default'], content: JSXElement, interfaceActions: SnapInterfaceActions): SnapInterface;
/**
 * Resolve the current user interface with the given value.
 *
 * @param value - The value to resolve the user interface with.
 * @yields Puts the resolve user interface action.
 */
export declare function resolveWithSaga(value: unknown): SagaIterator;
/**
 * A JSX element with a name.
 */
export declare type NamedJSXElement = JSXElement & {
    props: {
        name: string;
    };
};
/**
 * Get an element from a JSX tree with the given name.
 *
 * @param content - The interface content.
 * @param name - The element name.
 * @returns An object containing the element and the form name if it's contained
 * in a form, otherwise undefined.
 */
export declare function getElement(content: JSXElement, name: string): {
    element: NamedJSXElement;
    form?: string;
} | undefined;
/**
 * Get an element from a JSX tree with the given type.
 *
 * @param content - The interface content.
 * @param type - The element type.
 * @returns The element with the given type.
 */
export declare function getElementByType<Element extends JSXElement>(content: JSXElement, type: string): Element | undefined;
/**
 * Click on an element of the Snap interface.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface content.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 */
export declare function clickElement(controllerMessenger: RootControllerMessenger, id: string, content: JSXElement, snapId: SnapId, name: string): Promise<void>;
/**
 * Merge a value in the interface state.
 *
 * @param state - The actual interface state.
 * @param name - The component name that changed value.
 * @param value - The new value.
 * @param form - The form name if the element is in one.
 * @returns The state with the merged value.
 */
export declare function mergeValue(state: InterfaceState, name: string, value: string | File | boolean | null, form?: string): InterfaceState;
/**
 * Type a value in an interface element.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface Components.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 * @param value - The value to type in the element.
 */
export declare function typeInField(controllerMessenger: RootControllerMessenger, id: string, content: JSXElement, snapId: SnapId, name: string, value: string): Promise<void>;
/**
 * Type a value in an interface element.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface Components.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 * @param value - The value to type in the element.
 */
export declare function selectInDropdown(controllerMessenger: RootControllerMessenger, id: string, content: JSXElement, snapId: SnapId, name: string, value: string): Promise<void>;
/**
 * Upload a file to an interface element.
 *
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param id - The interface ID.
 * @param content - The interface Components.
 * @param snapId - The Snap ID.
 * @param name - The element name.
 * @param file - The file to upload. This can be a path to a file or a
 * `Uint8Array` containing the file contents. If this is a path, the file is
 * resolved relative to the current working directory.
 * @param options - The file options.
 * @param options.fileName - The name of the file. By default, this is
 * inferred from the file path if it's a path, and defaults to an empty string
 * if it's a `Uint8Array`.
 * @param options.contentType - The content type of the file. By default, this
 * is inferred from the file name if it's a path, and defaults to
 * `application/octet-stream` if it's a `Uint8Array` or the content type
 * cannot be inferred from the file name.
 */
export declare function uploadFile(controllerMessenger: RootControllerMessenger, id: string, content: JSXElement, snapId: SnapId, name: string, file: string | Uint8Array, options?: FileOptions): Promise<void>;
/**
 * Get the user interface actions for a Snap interface. These actions can be
 * used to interact with the interface.
 *
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger used to call actions.
 * @param interface - The interface object.
 * @param interface.content - The interface content.
 * @param interface.id - The interface ID.
 * @returns The user interface actions.
 */
export declare function getInterfaceActions(snapId: SnapId, controllerMessenger: RootControllerMessenger, { content, id }: Omit<Interface, 'type'> & {
    content: JSXElement;
}): SnapInterfaceActions;
/**
 * Get a user interface object from a Snap.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @param snapId - The Snap ID.
 * @param controllerMessenger - The controller messenger used to call actions.
 * @yields Takes the set interface action.
 * @returns The user interface object.
 */
export declare function getInterface(runSaga: RunSagaFunction, snapId: SnapId, controllerMessenger: RootControllerMessenger): SagaIterator;
