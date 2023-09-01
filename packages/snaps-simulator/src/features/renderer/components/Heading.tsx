import { Heading as ChakraHeading } from '@chakra-ui/react';
import { isComponent } from '@metamask/snaps-ui';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type HeadingProps = {
  id: string;
  node: unknown;
};

export const Heading: FunctionComponent<HeadingProps> = ({ node, id }) => {
  assert(isComponent(node), 'Expected value to be a valid UI component.');
  assert(node.type === 'heading', 'Expected value to be a heading component.');

  return (
    <ChakraHeading
      fontFamily="custom"
      fontSize="x-large"
      fontWeight="bold"
      paddingBottom="4"
      key={`${id}-heading`}
    >
      {node.value}
    </ChakraHeading>
  );
};
