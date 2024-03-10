import type { Component } from '../ui';
import { NodeType } from '../ui';
import type { SnapComponent, SnapProps } from './component';

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @returns The rendered component.
 */
export function jsx<Props>(
  component: SnapComponent<SnapProps<Props>>,
  props: SnapProps<Props>,
): Component | null {
  const result = component(props);

  // For the proof of concept, we only support panels and text nodes.
  if (result.type === 'panel') {
    return {
      type: NodeType.Panel,
      // @ts-expect-error - TODO.
      children: [result.props.children],
    };
  }

  if (result.type === 'text') {
    return {
      type: NodeType.Text,
      // @ts-expect-error - TODO.
      value: result.props.children,
    };
  }

  return null;
}
