import { Box } from '@chakra-ui/react';
import type { ContainerProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

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
