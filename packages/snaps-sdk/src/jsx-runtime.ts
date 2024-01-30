import type {
  Component as ComponentType,
  Heading as HeadingType,
  Panel as PanelType,
  Text as TextType,
} from './ui';
import { NodeType } from './ui/nodes';

/**
 *
 * @param type
 * @param props
 */
export function jsx(type: any, props: any) {
  return type(props);
}

// TODO(ritave): Figure out the difference between the two
export const jsxs = jsx;

/**
 *
 * @param props
 * @param props.children
 */
export function Panel(props: { children: ComponentType[] }): PanelType {
  return { type: NodeType.Panel, children: props.children };
}

/**
 *
 * @param props
 * @param props.children
 */
export function Heading(props: { children: string }): HeadingType {
  return { type: NodeType.Heading, value: props.children };
}

/**
 *
 * @param props
 * @param props.children
 */
export function Text(props: { children: string }): TextType {
  return { type: NodeType.Text, value: props.children };
}
