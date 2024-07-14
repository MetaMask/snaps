import { Input as ChakraInput } from '@chakra-ui/react';
import type { InputProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The input component renders an input field. See the {@link InputProps} type
 * for the props.
 *
 * @param props - The props of the component.
 * @param props.name - The name of the input field.
 * @param props.type - The type of the input field.
 * @param props.value - The default value of the input field.
 * @param props.placeholder - The placeholder text of the input field.
 * @returns The input element.
 */
export const Input: FunctionComponent<RenderProps<InputProps>> = ({
  name,
  type,
  value,
  placeholder,
}) => {
  return (
    <ChakraInput
      name={name}
      type={type}
      defaultValue={value}
      placeholder={placeholder}
    />
  );
};
