import { NodeType } from '../ui';
import type { SnapComponent, SnapProps } from './component';
import type {
  BoldElement,
  PanelElement,
  PanelProps,
  TextElement,
} from './components';
import { Panel } from './components';

type Element = BoldElement | PanelElement | TextElement;

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
): unknown | null {
  if (!component) {
    return jsx(Panel, props as PanelProps);
  }

  const result = component(props) as Element;

  // For the proof of concept, we only support panels and text nodes.
  if (result.type === 'panel') {
    const children = Array.isArray(result.props.children)
      ? result.props.children
      : [result.props.children];

    return {
      type: NodeType.Panel,
      children,
    };
  }

  if (result.type === 'text') {
    const value = Array.isArray(result.props.children)
      ? result.props.children.reduce<string>((accumulator, child) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          return `${accumulator}${child}`;
        }, '')
      : result.props.children;

    return {
      type: NodeType.Text,
      value,
    };
  }

  if (result.type === 'bold') {
    return `**${result.props.children}**`;
  }

  return null;
}

/**
 * The JSX runtime for Snaps SDK components. This function is used to render
 * Snap components into a format that can be used by the Snaps.
 *
 * The `jsxs` function is used for rendering nested components.
 *
 * @param component - The component to render.
 * @param props - The props to pass to the component.
 * @returns The rendered component.
 */
export function jsxs<Props>(
  component: SnapComponent<SnapProps<Props>>,
  props: SnapProps<Props>,
): unknown | null {
  return jsx(component, props);
}
