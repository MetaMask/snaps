import { Component, NodeType } from '@metamask/snaps-ui';

export type ComponentState = Record<string, string | Record<string, string>>;

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
      [component.name]: component.children.reduce(
        (acc, node) => constructState(acc, node),
        {},
      ),
    };
  }
  if (type === NodeType.Input) {
    return { [component.name]: '' };
  }

  return state;
};
