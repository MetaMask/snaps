import { Button as ChakraButton } from '@chakra-ui/react';
import type { ButtonProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../../Renderer';

/**
 * A footer button.
 *
 * @param props - The button props.
 * @param props.children - The button label.
 * @param props.Renderer - The Renderer component to use to render nested elements.
 * @returns The button element.
 */
export const Button: FunctionComponent<RenderProps<ButtonProps>> = ({
  children,
  Renderer,
}) => {
  return (
    <ChakraButton
      flexBasis={0}
      flexGrow={1}
      maxWidth="auto"
      variant="solid"
      size="large"
    >
      <Renderer id="button" element={children} />
    </ChakraButton>
  );
};
