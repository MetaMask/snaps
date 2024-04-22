import { NodeType, assert } from '@metamask/snaps-sdk';
import type {
  Input,
  FormState,
  InterfaceState,
  SnapInterface,
} from '@metamask/snaps-sdk';
import type {
  FieldElement,
  InputElement,
  JSXElement,
} from '@metamask/snaps-sdk/jsx';
import { isJSXElementUnsafe } from '@metamask/snaps-sdk/jsx';

/**
 * Construct the state for a stray input (not enclosed in a form).
 *
 * @param state - The interface state.
 * @param component - The Input component.
 * @returns The input state.
 */
export const constructInputState = (
  state: InterfaceState,
  component: Input,
) => {
  return component.value ?? state[component.name] ?? null;
};

/**
 * Construct the state for a form input.
 *
 * Sets the state to either the specified component value, the previous value
 * from the old state or null.
 *
 * @param state - The interface state.
 * @param component - The Input component.
 * @param form - The parent form name of the input.
 * @returns The input state.
 */
export const constructFormInputState = (
  state: InterfaceState,
  component: Input,
  form: string,
) => {
  const oldFormState = state[form] as FormState;
  const oldInputState = oldFormState?.[component.name];
  return component.value ?? oldInputState ?? null;
};

/**
 * Assert that the component name is unique in state.
 *
 * @param state - The interface state to verify against.
 * @param name - The component name to verify.
 */
export const assertNameIsUnique = (state: InterfaceState, name: string) => {
  assert(
    state[name] === undefined,
    `Duplicate component names are not allowed, found multiple instances of: "${name}".`,
  );
};

/**
 * Construct the state for an input field.
 *
 * @param oldState - The previous state.
 * @param element - The input element.
 * @returns The input state.
 */
function constructJsxInputState(
  oldState: InterfaceState,
  element: InputElement,
) {
  return element.props.value ?? oldState[element.props.name] ?? null;
}

/**
 * Construct the state for a form input.
 *
 * @param oldState - The previous state.
 * @param component - The input element.
 * @param form - The parent form name of the input.
 * @returns The input state.
 */
function constructJsxFormInputState(
  oldState: InterfaceState,
  component: InputElement,
  form: string,
) {
  const oldFormState = oldState[form] as FormState;
  const oldInputState = oldFormState?.[component.props.name];
  return component.props.value ?? oldInputState ?? null;
}

/**
 * Get the input field from a field element.
 *
 * @param element - The field element.
 * @returns The input element.
 */
function getJsxFieldInput(element: FieldElement) {
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
function constructJsxFormState(
  oldState: InterfaceState,
  component: FieldElement,
  form: string,
  newState: FormState,
): FormState {
  const input = getJsxFieldInput(component);
  assertNameIsUnique(newState, input.props.name);

  newState[input.props.name] = constructJsxFormInputState(
    oldState,
    input,
    form,
  );

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
function constructJsxState(
  oldState: InterfaceState,
  component: JSXElement,
  newState: InterfaceState,
): InterfaceState {
  if (component.type === 'box') {
    if (Array.isArray(component.props.children)) {
      return component.props.children.reduce(
        (accumulator, node) =>
          constructJsxState(oldState, node as JSXElement, accumulator),
        newState,
      );
    }

    return constructJsxState(
      oldState,
      component.props.children as JSXElement,
      newState,
    );
  }

  if (component.type === 'form') {
    assertNameIsUnique(newState, component.props.name);

    if (Array.isArray(component.props.children)) {
      newState[component.props.name] =
        component.props.children.reduce<FormState>((accumulator, node) => {
          return constructJsxFormState(
            oldState,
            node,
            component.props.name,
            accumulator,
          );
        }, {});

      return newState;
    }

    newState[component.props.name] = constructJsxFormState(
      oldState,
      component.props.children,
      component.props.name,
      {},
    );
  }

  if (component.type === 'input') {
    assertNameIsUnique(newState, component.props.name);
    newState[component.props.name] = constructJsxInputState(
      oldState,
      component,
    );
  }

  return newState;
}

/**
 * Construct the interface state for a given component tree while preserving
 * values for matching stateful components in the old state.
 *
 * @param oldState - The previous state.
 * @param component - The UI component to construct state from.
 * @param newState - The state that is being constructed.
 * @returns The interface state of the passed component.
 */
export const constructState = (
  oldState: InterfaceState,
  component: SnapInterface,
  newState: InterfaceState = {},
): InterfaceState => {
  if (isJSXElementUnsafe(component)) {
    return constructJsxState(oldState, component, newState);
  }

  const { type } = component;
  if (type === NodeType.Panel) {
    return component.children.reduce(
      (acc, node) => constructState(oldState, node, acc),
      newState,
    );
  }

  if (type === NodeType.Form) {
    assertNameIsUnique(newState, component.name);
    newState[component.name] = component.children.reduce<FormState>(
      (acc, node) => {
        if (node.type === NodeType.Input) {
          assertNameIsUnique(acc, node.name);
          acc[node.name] = constructFormInputState(
            oldState,
            node,
            component.name,
          );
        }

        return acc;
      },
      {},
    );
  }

  if (type === NodeType.Input) {
    assertNameIsUnique(newState, component.name);
    newState[component.name] = constructInputState(oldState, component);
  }

  return newState;
};
