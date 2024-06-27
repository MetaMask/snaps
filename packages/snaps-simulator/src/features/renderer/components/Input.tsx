import { Input as ChakraInput } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { ChangeEvent, FunctionComponent } from 'react';

import { useSnapInterfaceContext } from '../../../contexts';

export type InputProps = {
  id: string;
  node: unknown;
  form?: string;
};

export const Input: FunctionComponent<InputProps> = ({ node, id, form }) => {
  const { handleInputChange, getValue } = useSnapInterfaceContext();
  assertJSXElement(node);
  assert(node.type === 'Input', 'Expected value to be an input component.');

  const { props } = node;

  const value = getValue(props.name, form);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(props.name, event.target.value, form);
  };

  return (
    <ChakraInput
      key={`${id}-input`}
      value={value as string}
      type={props.type}
      placeholder={props.placeholder}
      onChange={handleChange}
    />
  );
};
