import { assert } from '@metamask/snaps-sdk';
import type {
  FormState,
  InterfaceState,
  ComponentOrElement,
  InterfaceContext,
} from '@metamask/snaps-sdk';
import type {
  ButtonElement,
  DropdownElement,
  FieldElement,
  InputElement,
  JSXElement,
  OptionElement,
} from '@metamask/snaps-sdk/jsx';
import { isJSXElementUnsafe } from '@metamask/snaps-sdk/jsx';
import {
  getJsonSizeUnsafe,
  getJsxChildren,
  getJsxElementFromComponent,
} from '@metamask/snaps-utils';

/**
 * Get a JSX element from a component or JSX element. If the component is a
 * JSX element, it is returned as is. Otherwise, the component is converted to
 * a JSX element.
 *
 * @param component - The component to convert.
 * @returns The JSX element.
 */
export function getJsxInterface(component: ComponentOrElement): JSXElement {
  if (isJSXElementUnsafe(component)) {
    return component;
  }

  return getJsxElementFromComponent(component);
}

/**
 * Assert that the component name is unique in state.
 *
 * @param state - The interface state to verify against.
 * @param name - The component name to verify.
 */
export function assertNameIsUnique(state: InterfaceState, name: string) {
  assert(
    state[name] === undefined,
    `Duplicate component names are not allowed, found multiple instances of: "${name}".`,
  );
}

/**
 * Construct default state for a component.
 *
 * This function is meant to be used inside constructInputState to account
 * for component specific defaults and will not override the component value or existing form state.
 *
 * @param element - The input element.
 * @returns The default state for the specific component, if any.
 */
function constructComponentSpecificDefaultState(
  element: InputElement | DropdownElement,
) {
  if (element.type === 'Dropdown') {
    const children = getJsxChildren(element) as OptionElement[];
    return children[0]?.props.value;
  }

  return null;
}

/**
 * Construct the state for an input field.
 *
 * @param oldState - The previous state.
 * @param element - The input element.
 * @returns The input state.
 */
function constructInputState(
  oldState: InterfaceState,
  element: InputElement | DropdownElement,
) {
  return (
    element.props.value ??
    oldState[element.props.name] ??
    constructComponentSpecificDefaultState(element) ??
    null
  );
}

/**
 * Construct the state for a form input.
 *
 * @param oldState - The previous state.
 * @param component - The input element.
 * @param form - The parent form name of the input.
 * @returns The input state.
 */
function constructFormInputState(
  oldState: InterfaceState,
  component: InputElement | DropdownElement,
  form: string,
) {
  const oldFormState = oldState[form] as FormState;
  const oldInputState = oldFormState?.[component.props.name];
  return (
    component.props.value ??
    oldInputState ??
    constructComponentSpecificDefaultState(component) ??
    null
  );
}

/**
 * Get the input field from a field element.
 *
 * @param element - The field element.
 * @returns The input element.
 */
function getFieldInput(element: FieldElement) {
  if (Array.isArray(element.props.children)) {
    return element.props.children[0];
  }

  return element.props.children;
}

/**
 * Construct the state for a form input.
 *
 * @param oldState - The previous state.
 * @param component - The field element.
 * @param form - The parent form name of the input.
 * @param newState - The new state.
 * @returns The input state.
 */
function constructFormState(
  oldState: InterfaceState,
  component: FieldElement | ButtonElement,
  form: string,
  newState: FormState,
): FormState {
  if (component.type === 'Button') {
    return newState;
  }

  const input = getFieldInput(component);
  assertNameIsUnique(newState, input.props.name);

  newState[input.props.name] = constructFormInputState(oldState, input, form);

  return newState;
}

/**
 * Construct the interface state for a given component tree.
 *
 * @param oldState - The previous state.
 * @param component - The UI component to construct state from.
 * @param newState - The state that is being constructed.
 * @returns The interface state of the passed component.
 */
export function constructState(
  oldState: InterfaceState,
  component: JSXElement,
  newState: InterfaceState = {},
): InterfaceState {
  if (component.type === 'Box') {
    const children = getJsxChildren(component);
    return children.reduce(
      (accumulator, node) =>
        constructState(oldState, node as JSXElement, accumulator),
      newState,
    );
  }

  if (component.type === 'Form') {
    assertNameIsUnique(newState, component.props.name);

    const children = getJsxChildren(component);
    newState[component.props.name] = children.reduce<FormState>(
      (accumulator, node) => {
        return constructFormState(
          oldState,
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          node as FieldElement | ButtonElement,
          component.props.name,
          accumulator,
        );
      },
      {},
    );

    return newState;
  }

  if (component.type === 'Input' || component.type === 'Dropdown') {
    assertNameIsUnique(newState, component.props.name);
    newState[component.props.name] = constructInputState(oldState, component);
  }

  return newState;
}

const MAX_CONTEXT_SIZE = 1_000_000; // 1 mb

/**
 * Validate a JSON blob to be used as the interface context.
 *
 * @param context - The JSON blob.
 * @throws If the JSON blob is too large.
 */
export function validateInterfaceContext(context?: InterfaceContext) {
  if (!context) {
    return;
  }

  // We assume the validity of this JSON to be validated by the caller.
  // E.g., in the RPC method implementation.
  const size = getJsonSizeUnsafe(context);
  assert(
    size <= MAX_CONTEXT_SIZE,
    `A Snap interface context may not be larger than ${
      MAX_CONTEXT_SIZE / 1000000
    } MB.`,
  );
}
