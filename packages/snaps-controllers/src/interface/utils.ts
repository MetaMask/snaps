import type { Component } from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';

export type ComponentState = Record<
  string,
  string | Record<string, string | null> | null
>;

export const constructState = (
  state: ComponentState,
  component: Component,
): ComponentState => {
  const { type } = component;
  if (type === NodeType.Panel) {
    return component.children.reduce(
      (acc, node) => constructState(acc, node),
      state,
    );
  }
  if (type === NodeType.Form) {
    return {
      ...state,
      [component.name]: component.children.reduce(
        (acc, node) => constructState(acc, node),
        {},
      ),
    };
  }
  if (type === NodeType.Input) {
    return { ...state, [component.name]: null };
  }

  return state;
};
