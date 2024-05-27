import type { FunctionComponent } from 'react';
import { useSnapInterface } from 'src/hooks';

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
  interfaceId: string;
  snapId: string;
  id?: string;
};

/**
 * A UI renderer for Snaps UI.
 *
 * @param props - The component props.
 * @param props.interfaceId - The interface ID.
 * @param props.snapId - The Snap ID.
 * @param props.id - The component ID, to be used as a prefix for component
 * keys.
 * @returns The renderer component.
 */
export const Renderer: FunctionComponent<RendererProps> = ({
  interfaceId,
  snapId,
  id = 'root',
}) => {
  const snapInterface = useSnapInterface(snapId, interfaceId);

  if (!snapInterface) {
    return null;
  }

  const { content } = snapInterface;
  const ReactComponent = components[content.type];

  if (!ReactComponent) {
    throw new Error(`Unknown component type: ${content.type}.`);
  }

  return <ReactComponent id={id} node={content} />;
};
