import { Link as ChakraLink } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type LinkProps = {
  id: string;
  node: unknown;
};

export const Link: FunctionComponent<LinkProps> = ({ node, id }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(node.type === 'link', 'Expected value to be a link component.');

  return (
    <ChakraLink
      fontFamily="custom"
      fontSize="sm"
      paddingBottom="1"
      key={`${id}-link`}
      href={node.url}
    >
      {node.value}
    </ChakraLink>
  );
};
