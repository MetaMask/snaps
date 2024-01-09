import type { Component, Input } from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import type { FormState, InterfaceState } from '@metamask/snaps-utils';

/**
 * Finds the previous value of the input in the old state or sets the input to null.
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
 * Finds the previous value of the input in the old state form or sets the input to null.
 *
 * @param state - The interface state.
 * @param component - The Input component.
 * @param form - The parent form name of the input.
 * @returns The input state.
 */
export const constructFormState = (
  state: InterfaceState,
  component: Input,
  form: string,
) => {
  const oldFormState = state[form] as FormState;
  const oldInputState = oldFormState?.[component.name];
  return component.value ?? oldInputState ?? null;
};

/**
 * Construcs the interface state for a given component tree while preserving values for matching stateful components in the old state.
 *
 * @param oldState - The previous state.
 * @param component - The UI component to construct state from.
 * @param newState - The state that is being constructed.
 * @returns The interface state of the passed component.
 */
export const constructState = (
  oldState: InterfaceState,
  component: Component,
  newState: InterfaceState = {},
): InterfaceState => {
  const { type } = component;
  if (type === NodeType.Panel) {
    return component.children.reduce(
      (acc, node) => constructState(oldState, node, acc),
      newState,
    );
  }

  if (type === NodeType.Form) {
    newState[component.name] = component.children.reduce<FormState>(
      (acc, node) => {
        if (node.type === NodeType.Input) {
          acc[node.name] = constructFormState(oldState, node, component.name);
        }

        return acc;
      },
      {},
    );
    return newState;
  }

  if (type === NodeType.Input) {
    return {
      ...newState,
      [component.name]: constructInputState(oldState, component),
    };
  }

  return newState;
};
