import { Text as ChakraText } from '@chakra-ui/react';
import type { TextProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The text component. See {@link TextProps} for the props.
 *
 * @param props - The text props.
 * @param props.id - The unique ID to use as key for the renderer.
 * @param props.children - The text content.
 * @param props.Renderer - The Renderer component to use to render nested
 * elements.
 * @returns The rendered text.
 */
export const Text: FunctionComponent<RenderProps<TextProps>> = ({
  id,
  children,
  Renderer,
}) => {
  return (
    <ChakraText>
      <Renderer id={`${id}-text`} element={children} />
    </ChakraText>
  );
};
