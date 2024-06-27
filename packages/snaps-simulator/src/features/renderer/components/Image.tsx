import { Image as ChakraImage } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type ImageProps = {
  id: string;
  node: unknown;
};

export const Image: FunctionComponent<ImageProps> = ({ id, node }) => {
  assertJSXElement(node);
  assert(node.type === 'Image', 'Expected value to be a image component.');

  const { props } = node;
  const src = `data:image/svg+xml;utf8,${encodeURIComponent(props.src)}`;

  return <ChakraImage key={`${id}-image`} src={src} alt={props.alt} />;
};
