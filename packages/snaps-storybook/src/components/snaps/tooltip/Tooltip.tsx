import { Box, Tooltip as ChakraTooltip } from '@chakra-ui/react';
import type { TooltipProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import type { RenderProps } from '../../Renderer';

/**
 * The text component. See {@link TooltipProps} for the props.
 *
 * @param props - The tooltip props.
 * @param props.content - The text to display in the tooltip.
 * @param props.children - The children to render outside the tooltip, which
 * will trigger the tooltip to display.
 * @param props.Renderer - The Renderer component to use to render nested
 * elements.
 * @returns The rendered text.
 */
export const Tooltip: FunctionComponent<RenderProps<TooltipProps>> = ({
  content,
  children,
  Renderer,
}) => {
  return (
    <ChakraTooltip
      hasArrow={true}
      label={<Renderer id="tooltip" element={content} />}
    >
      <Box width="fit-content">
        <Renderer id="text" element={children} />
      </Box>
    </ChakraTooltip>
  );
};
