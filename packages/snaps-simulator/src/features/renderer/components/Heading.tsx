import { Heading as ChakraHeading } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type HeadingProps = {
  id: string;
  node: unknown;
};

export const Heading: FunctionComponent<HeadingProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Heading', 'Expected value to be a heading component.');

  const { props } = node;
  return (
    <ChakraHeading
      fontFamily="custom"
      fontSize="x-large"
      fontWeight="bold"
      paddingBottom="4"
      key={`${id}-heading`}
    >
      {props.children}
    </ChakraHeading>
  );
};
