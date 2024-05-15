import {
  Input,
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '@chakra-ui/react';
import type { InputElement } from '@metamask/snaps-sdk/jsx-runtime';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type FieldProps = {
  id: string;
  node: unknown;
};

export const Field: FunctionComponent<FieldProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Field', 'Expected value to be a field component.');

  const input = getJsxChildren(node)[0] as InputElement;

  const { props } = node;
  return (
    <FormControl isInvalid={Boolean(props.error)} key={`${id}-field`}>
      {props.label && <FormLabel>{props.label}</FormLabel>}
      <Input
        value={input.props.value}
        type={input.props.type}
        placeholder={input.props.placeholder}
      />
      <FormErrorMessage>{props.error}</FormErrorMessage>
    </FormControl>
  );
};
