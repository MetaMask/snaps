import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import type { ButtonElement, InputElement } from '@metamask/snaps-sdk/jsx';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { getJsxChildren } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

import { Button } from './Button';
import { Input } from './Input';

export type FieldProps = {
  id: string;
  node: unknown;
  form?: string;
};

export const Field: FunctionComponent<FieldProps> = ({ node, id, form }) => {
  assertJSXElement(node);
  assert(node.type === 'Field', 'Expected value to be a field component.');

  const children = getJsxChildren(node);

  const input = children[0] as InputElement;

  const button = children[1] as ButtonElement;

  const { props } = node;

  return (
    <FormControl isInvalid={Boolean(props.error)} key={`${id}-field`}>
      {props.label && <FormLabel>{props.label}</FormLabel>}

      <Input id={id} node={input} form={form} />
      {button && <Button id={id} node={button} />}
      <FormErrorMessage>{props.error}</FormErrorMessage>
    </FormControl>
  );
};
