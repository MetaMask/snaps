import { Image as ChakraImage } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type ImageProps = {
  id: string;
  node: unknown;
};

export const Image: FunctionComponent<ImageProps> = ({ id, node }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(node.type === 'image', 'Expected value to be a image component.');

  const src = `data:image/svg+xml;utf8,${encodeURIComponent(node.value)}`;

  return <ChakraImage key={`${id}-image`} src={src} />;
};
