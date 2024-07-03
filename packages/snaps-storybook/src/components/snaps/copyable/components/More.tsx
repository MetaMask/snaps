import type { ButtonProps } from '@chakra-ui/react';
import { Box, Button } from '@chakra-ui/react';
import type { FunctionComponent, ReactNode } from 'react';

import { useOverflow } from '../hooks';

/**
 * The props for the {@link More} component.
 *
 * @see ButtonProps
 */
export type MoreProps = ButtonProps & {
  /**
   * The content to render.
   */
  children: ReactNode;

  /**
   * Whether the content is expanded.
   */
  isExpanded: boolean;

  /**
   * Whether the content is sensitive.
   */
  sensitive?: boolean;
};

/**
 * Get the gradient for the more button.
 *
 * @param sensitive - Whether the content is sensitive.
 * @returns The gradient for the more button.
 */
function getGradient(sensitive: boolean) {
  return sensitive
    ? 'linear(to right, transparent 0%, error.muted 33%)'
    : 'linear(to right, transparent 0%, background.alternative 33%)';
}

/**
 * The more component. This renders the content and a more button if the content
 * is overflowing (i.e., the content is taller than the container).
 *
 * @param props - The component props.
 * @param props.children - The content to render.
 * @param props.isExpanded - Whether the content is expanded.
 * @param props.sensitive - Whether the content is sensitive.
 * @returns The more element.
 */
export const More: FunctionComponent<MoreProps> = ({
  children,
  isExpanded,
  sensitive = false,
  ...props
}) => {
  const { contentRef, isOverflow } = useOverflow();

  return (
    <Box
      ref={contentRef}
      position="relative"
      maxHeight={isExpanded ? 'none' : '5.5rem'}
      overflow="hidden"
    >
      {children}
      {isOverflow && !isExpanded && (
        <Box
          position="absolute"
          bottom="0"
          right="0"
          bgGradient="linear-gradient(90deg, transparent 0%, background.default 33%)"
        >
          <Button
            paddingLeft="8"
            bgGradient={getGradient(sensitive)}
            color="inherit"
            lineHeight="inherit"
            verticalAlign="baseline"
            {...props}
          >
            more
          </Button>
        </Box>
      )}
    </Box>
  );
};
