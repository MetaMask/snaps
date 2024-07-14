import { FormControl, FormErrorMessage, FormLabel } from '@chakra-ui/react';
import type { FieldProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';
import { Input } from './components';

/**
 * The field component, which wraps an input element with a label and optional
 * error message. See the {@link FieldProps} type for the props.
 *
 * @param props - The props of the component.
 * @param props.label - The label of the field.
 * @param props.error - The error message of the field.
 * @param props.children - The input field to render inside the field.
 * @param props.Renderer - The renderer to use for the input field.
 * @returns The field element.
 */
export const Field: FunctionComponent<RenderProps<FieldProps>> = ({
  label,
  error,
  children,
  Renderer,
}) => (
  <FormControl isInvalid={Boolean(error)}>
    <FormLabel>{label}</FormLabel>
    <Input element={children} Renderer={Renderer} />
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
  </FormControl>
);
