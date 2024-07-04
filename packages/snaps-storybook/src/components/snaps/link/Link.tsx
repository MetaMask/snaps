import { Link as ChakraLink } from '@chakra-ui/react';
import type { LinkProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { ExportIcon } from '../../icons';
import type { RenderProps } from '../../Renderer';

export const Link: FunctionComponent<RenderProps<LinkProps>> = ({
  href,
  children,
  Renderer,
}) => (
  <ChakraLink target="_blank" href={href}>
    <Renderer id="link" element={children} />
    <ExportIcon />
  </ChakraLink>
);
