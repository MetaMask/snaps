import { Button as ChakraButton } from '@chakra-ui/react';
import { assertIsComponent } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { FunctionComponent } from 'react';

export type ButtonProps = {
  id: string;
  node: unknown;
};

const BUTTON_VARIANTS = {
  primary: 'primary',
  secondary: 'outline',
};

export const Button: FunctionComponent<ButtonProps> = ({ node, id }) => {
  assertIsComponent(node);
  assert(node.type === 'button', 'Expected value to be a button component.');

  return (
    <ChakraButton
      key={`${id}-button`}
      width="100%"
      variant={BUTTON_VARIANTS[node.variant ?? 'primary']}
      marginBottom="4"
    >
      {node.value}
    </ChakraButton>
  );
};
