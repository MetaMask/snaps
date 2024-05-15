import type { ComponentOrElement } from '@metamask/snaps-sdk';
import { getJsxInterface } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';

import {
  Bold,
  Copyable,
  Box,
  Text,
  Divider,
  Heading,
  Spinner,
  Image,
  Button,
  Form,
  Input,
  Field,
  Italic,
  Link,
} from './components';

export const components: Partial<
  Record<string, FunctionComponent<{ id: string; node: unknown }>>
> = {
  Bold,
  Box,
  Button,
  Copyable,
  Divider,
  Field,
  Form,
  Heading,
  Input,
  Italic,
  Link,
  Spinner,
  Text,
  Image,
};

type RendererProps = {
  node: ComponentOrElement;
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
  const element = getJsxInterface(node);
  const ReactComponent = components[element.type];

  if (!ReactComponent) {
    throw new Error(`Unknown component type: ${node.type}.`);
  }

  return <ReactComponent id={id} node={element} />;
};
