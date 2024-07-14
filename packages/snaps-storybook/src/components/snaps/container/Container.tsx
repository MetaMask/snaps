import { Box } from '@chakra-ui/react';
import type { ContainerProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The container component. It simply renders the children in a box.
 *
 * @param props - The component props.
 * @param props.children - The children to render in the container.
 * @param props.Renderer - The renderer to use for rendering the children.
 * @returns The container element.
 */
export const Container: FunctionComponent<RenderProps<ContainerProps>> = ({
  children,
  Renderer,
}) => {
  return (
    <Box>
      <Renderer id="container" element={children} />
    </Box>
  );
};
