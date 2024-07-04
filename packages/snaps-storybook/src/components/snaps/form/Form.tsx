import { Flex } from '@chakra-ui/react';
import type { FormProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The form component renders a form element.
 *
 * @param props - The component props.
 * @param props.name - The name of the form.
 * @param props.children - The children of the form.
 * @param props.Renderer - The renderer to use for rendering the children.
 * @returns The form element.
 */
export const Form: FunctionComponent<RenderProps<FormProps>> = ({
  name,
  children,
  Renderer,
}) => (
  <Flex as="form" direction="column" name={name} gap="2">
    <Renderer id="form" element={children} />
  </Flex>
);
