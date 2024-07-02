import { Button as ChakraButton } from '@chakra-ui/react';
import type { ButtonProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

/**
 * The button component. See {@link ButtonProps} for the props.
 *
 * @param props - The button props.
 * @param props.name - The button name. This is not displayed to the user.
 * @param props.type - The button type. Defaults to `'button'`.
 * @param props.variant - The button variant.
 * @param props.disabled - Whether the button is disabled.
 * @param props.children - The button label.
 * @returns The rendered button.
 */
export const Button: FunctionComponent<ButtonProps> = ({
  name,
  type = 'button',
  variant,
  disabled = false,
  children,
}) => (
  <ChakraButton name={name} type={type} variant={variant} isDisabled={disabled}>
    {children}
  </ChakraButton>
);
