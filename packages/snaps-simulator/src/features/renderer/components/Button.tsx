import { Button as ChakraButton } from '@chakra-ui/react';
import { ButtonType, UserInputEventType } from '@metamask/snaps-sdk';
import { assertJSXElement } from '@metamask/snaps-sdk/jsx';
import { assert } from '@metamask/utils';
import type { MouseEvent, FunctionComponent } from 'react';

import { useSnapInterfaceContext } from '../../../contexts';

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

  const { handleEvent } = useSnapInterfaceContext();

  const { props } = node;

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (props.type === ButtonType.Button) {
      event.preventDefault();
    }

    handleEvent({
      event: UserInputEventType.ButtonClickEvent,
      name: props.name,
    });
  };

  return (
    <ChakraButton
      key={`${id}-button`}
      width="100%"
      variant={BUTTON_VARIANTS[props.variant ?? 'primary']}
      marginBottom="4"
      type={props.type}
      onClick={handleClick}
    >
      {props.children}
    </ChakraButton>
  );
};
