import type { JSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import type { FunctionComponent } from 'react';

import { generateKey } from '../../utils';
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
  Record<
    string,
    FunctionComponent<{ id: string; node: unknown; form?: string }>
  >
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

type SnapComponentProps = {
  node: JSXElement;
  form?: string;
  map?: Record<string, number>;
  id?: string;
};

export const SnapComponent: FunctionComponent<SnapComponentProps> = ({
  node,
  form,
  map = {},
  id = generateKey(map, node),
}) => {
  const ReactComponent = components[node.type];
  if (!ReactComponent) {
    throw new Error(`Unknown component type: ${node.type}.`);
  }

  return <ReactComponent id={id} node={node} form={form} key={id} />;
};
