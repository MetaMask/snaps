import {
  Input as ChakraInput,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';
import { assertIsComponent } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type InputProps = {
  id: string;
  node: unknown;
};

export const Input: FunctionComponent<InputProps> = ({ node, id }) => {
  assertIsComponent(node);
  assert(node.type === 'input', 'Expected value to be an input component.');

  return (
    <FormControl isInvalid={Boolean(node.error)} key={`${id}-input`}>
      {node.label && <FormLabel>{node.label}</FormLabel>}
      <ChakraInput
        value={node.value}
        type={node.inputType}
        placeholder={node.placeholder}
      />
      <FormErrorMessage>{node.error}</FormErrorMessage>
    </FormControl>
  );
};
