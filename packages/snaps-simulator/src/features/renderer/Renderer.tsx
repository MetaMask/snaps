import type { ComponentOrElement, SnapId } from '@metamask/snaps-sdk';
import { getJsxInterface } from '@metamask/snaps-utils';
import type { FunctionComponent } from 'react';
import { useSelector } from 'src/hooks';

import { getSnapInterfaceController } from '../simulation';
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
 * @param props.node - The component to render.
 * @param props.id - The component ID, to be used as a prefix for component
 * keys.
 * @param props.interfaceId
 * @param props.snapId
 * @returns The renderer component.
 */
export const Renderer: FunctionComponent<RendererProps> = ({
  interfaceId,
  snapId,
  id = 'root',
}) => {
  const snapInterfaceController = useSelector(getSnapInterfaceController);
  console.log('interface id in Renderer', interfaceId);

  if (!interfaceId) {
    return null;
  }

  const element = snapInterfaceController?.getInterface(
    snapId as SnapId,
    interfaceId,
  )?.content;

  if (!element) {
    return null;
  }
  const ReactComponent = components[element.type];

  if (!ReactComponent) {
    throw new Error(`Unknown component type: ${element.type}.`);
  }

  return <ReactComponent id={id} node={element} />;
};
