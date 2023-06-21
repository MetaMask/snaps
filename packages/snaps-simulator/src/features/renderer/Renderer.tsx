import type { Component } from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import type { FunctionComponent } from 'react';

import {
  Copyable,
  Panel,
  Text,
  Divider,
  Heading,
  Spinner,
  Image,
} from './components';

export const components: Partial<
  Record<NodeType, FunctionComponent<{ id: string; node: unknown }>>
> = {
  [NodeType.Copyable]: Copyable,
  [NodeType.Divider]: Divider,
  [NodeType.Heading]: Heading,
  [NodeType.Panel]: Panel,
  [NodeType.Spinner]: Spinner,
  [NodeType.Text]: Text,
  [NodeType.Image]: Image,
  // @todo: Create a button
  // TODO(@guillaumerx): Quick fix to build, update those later
  [NodeType.Button]: Text,
  [NodeType.Input]: Text,
  [NodeType.Form]: Text,
};

type RendererProps = {
  node: Component;
  id?: string;
};

/**
 * A UI renderer for Snaps UI.
 *
 * @param props - The component props.
 * @param props.node - The component to render.
 * @param props.id - The component ID, to be used as a prefix for component
 * keys.
 * @returns The renderer component.
 */
export const Renderer: FunctionComponent<RendererProps> = ({
  node,
  id = 'root',
}) => {
  const ReactComponent = components[node.type];

  if (!ReactComponent) {
    throw new Error(`Unknown component type: ${node.type}.`);
  }

  return <ReactComponent id={id} node={node} />;
};
