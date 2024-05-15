import { Button as ChakraButton } from '@chakra-ui/react';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx-runtime';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type ButtonProps = {
  id: string;
  node: unknown;
};

const BUTTON_VARIANTS = {
  primary: 'primary',
  destructive: 'outline',
};

export const Button: FunctionComponent<ButtonProps> = ({ node, id }) => {
  assertJSXElement(node);
  assert(node.type === 'Button', 'Expected value to be a button component.');

  const { props } = node;
  return (
    <ChakraButton
      key={`${id}-button`}
      width="100%"
      variant={BUTTON_VARIANTS[props.variant ?? 'primary']}
      marginBottom="4"
      type={props.type}
    >
      {props.children}
    </ChakraButton>
  );
};
