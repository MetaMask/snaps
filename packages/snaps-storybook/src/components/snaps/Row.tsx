import {
  Box,
  Flex,
  Text,
  Tooltip as ChakraTooltip,
  useStyleConfig,
} from '@chakra-ui/react';
import type { RowProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { DangerIcon, QuestionIcon, WarningIcon } from '../icons';
import type { RenderProps } from '../Renderer';
import { Renderer } from '../Renderer';

/**
 * Get the icon for the row variant.
 *
 * @param variant - The variant of the row.
 * @returns The icon for the row variant.
 */
function getRowIcon(variant: RowProps['variant']) {
  switch (variant) {
    case 'warning':
      return <WarningIcon />;
    case 'critical':
      return <DangerIcon />;
    default:
      return <QuestionIcon color="icon.muted" />;
  }
}

/**
 * The props for the {@link Tooltip} component.
 */
type TooltipProps = Pick<RowProps, 'tooltip' | 'variant'>;

/**
 * The tooltip component, which is rendered in the row.
 *
 * @param props - The props of the component.
 * @param props.tooltip - The tooltip content.
 * @param props.variant - The variant of the tooltip.
 * @returns The tooltip element.
 */
const Tooltip: FunctionComponent<TooltipProps> = ({ tooltip, variant }) => {
  if (!tooltip) {
    return null;
  }

  return (
    <ChakraTooltip label={tooltip} placement="bottom">
      {getRowIcon(variant)}
    </ChakraTooltip>
  );
};

/**
 * The row component. See {@link RowProps} for the props.
 *
 * @param props - The props of the component.
 * @param props.id - The unique ID to use as key for the renderer.
 * @param props.label - The label of the row.
 * @param props.variant - The variant of the row.
 * @param props.tooltip - The tooltip content.
 * @param props.children - The children of the row.
 * @returns A row element.
 */
export const Row: FunctionComponent<RenderProps<RowProps>> = ({
  id,
  label,
  variant = 'default',
  tooltip,
  children,
}) => {
  const styles = useStyleConfig('Row', { variant });

  return (
    <Box __css={styles}>
      <Flex alignItems="center" gap="1">
        <Text fontWeight="500">{label}</Text>
        <Tooltip tooltip={tooltip} variant={variant} />
      </Flex>
      <Renderer id={`${id}-row`} element={children} />
    </Box>
  );
};
