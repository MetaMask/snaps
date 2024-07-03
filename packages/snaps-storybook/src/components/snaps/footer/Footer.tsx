import { Box } from '@chakra-ui/react';
import type { FooterProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';
import { Buttons } from './components';

/**
 * The footer component. See {@link FooterProps} for the props.
 *
 * @param props - The component props.
 * @param props.children - The footer buttons.
 * @param props.Renderer - The Renderer component to use to render nested
 * elements.
 * @returns The rendered footer.
 */
export const Footer: FunctionComponent<RenderProps<FooterProps>> = (props) => {
  return (
    <Box
      padding="4"
      gap="2"
      display="flex"
      background="background.default"
      marginTop="auto"
      boxShadow="md"
      clipPath="inset(-16px 0px 0px 0px)"
    >
      <Buttons {...props} />
    </Box>
  );
};
