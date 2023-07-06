import { Image as ChakraImage } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import { FunctionComponent } from 'react';

export type ImageProps = {
  id: string;
  node: unknown;
};

export const Image: FunctionComponent<ImageProps> = ({ node, id }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(node.type === 'image', 'Expected value to be an image component.');

  const url = `data:image/svg+xml;base64,${btoa(node.value)}`;

  return <ChakraImage key={`${id}-image`} width="100%" src={url} />;
};
