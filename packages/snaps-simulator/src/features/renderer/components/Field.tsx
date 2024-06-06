import {
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';
import type { InputElement } from '@metamask/snaps-sdk/jsx';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { ChangeEvent, FunctionComponent } from 'react';
import { useSnapInterfaceContext } from 'src/contexts';

export type FieldProps = {
  id: string;
  node: unknown;
  form: string;
};

export const Field: FunctionComponent<FieldProps> = ({ node, id, form }) => {
  const { handleInputChange, getValue } = useSnapInterfaceContext();
  assertJSXElement(node);
  assert(node.type === 'Field', 'Expected value to be a field component.');

  const input = getJsxChildren(node)[0] as InputElement;

  const value = getValue(input.props.name, form);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleInputChange(input.props.name, event.target.value, form);
  };

  const { props } = node;

  return (
    <FormControl isInvalid={Boolean(props.error)} key={`${id}-field`}>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Input
        value={value}
        type={input.props.type}
        placeholder={input.props.placeholder}
        onChange={handleChange}
      />
      <FormErrorMessage>{props.error}</FormErrorMessage>
    </FormControl>
  );
};
