import { Input as ChakraInput } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type InputProps = {
  id: string;
  node: unknown;
};

export const Input: FunctionComponent<InputProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Input', 'Expected value to be an input component.');

  const { props } = node;

  return (
    <ChakraInput
      key={`${id}-input`}
      value={props.value}
      type={props.type}
      placeholder={props.placeholder}
    />
  );
};
