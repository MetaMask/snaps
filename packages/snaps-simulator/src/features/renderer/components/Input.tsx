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
        fontSize="sm"
        bg="chakra-body-bg"
        borderColor="border.default"
        outline="none"
        _active={{
          borderColor: 'border.active',
          outline: 'none',
          boxShadow: 'none',
        }}
        _focusVisible={{
          borderColor: 'border.active',
          outline: 'none',
          boxShadow: 'none',
        }}
        value={node.value}
        type={node.inputType}
        placeholder={node.placeholder}
        marginBottom="0"
      />
      {node.error && <FormErrorMessage>{node.error}</FormErrorMessage>}
    </FormControl>
  );
};
