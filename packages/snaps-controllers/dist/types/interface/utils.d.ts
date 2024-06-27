import type { InterfaceState, ComponentOrElement, InterfaceContext } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
/**
 * Get a JSX element from a component or JSX element. If the component is a
 * JSX element, it is returned as is. Otherwise, the component is converted to
 * a JSX element.
 *
 * @param component - The component to convert.
 * @returns The JSX element.
 */
export declare function getJsxInterface(component: ComponentOrElement): JSXElement;
/**
 * Assert that the component name is unique in state.
 *
 * @param state - The interface state to verify against.
 * @param name - The component name to verify.
 */
export declare function assertNameIsUnique(state: InterfaceState, name: string): void;
/**
 * Construct the interface state for a given component tree.
 *
 * @param oldState - The previous state.
 * @param rootComponent - The UI component to construct state from.
 * @returns The interface state of the passed component.
 */
export declare function constructState(oldState: InterfaceState, rootComponent: JSXElement): InterfaceState;
/**
 * Validate a JSON blob to be used as the interface context.
 *
 * @param context - The JSON blob.
 * @throws If the JSON blob is too large.
 */
export declare function validateInterfaceContext(context?: InterfaceContext): void;
