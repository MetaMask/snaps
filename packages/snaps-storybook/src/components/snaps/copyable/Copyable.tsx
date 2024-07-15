import { Box, Text, useStyleConfig } from '@chakra-ui/react';
import type { CopyableProps } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';
import { useState } from 'react';

import type { RenderProps } from '../../Renderer';
import { More, Copy, Sensitive } from './components';

/**
 * A copyable element, which shows a value that can be copied to the clipboard.
 * If the value is sensitive, it can be revealed by the user.
 *
 * See {@link CopyableProps} for the props.
 *
 * @param props - The component props.
 * @param props.sensitive - Whether the value is sensitive and should be
 * obscured.
 * @param props.value - The value to display.
 * @returns The copyable element.
 */
export const Copyable: FunctionComponent<RenderProps<CopyableProps>> = ({
  sensitive,
  value,
}) => {
  const [isExpanded, setExpanded] = useState(false);
  const [isRevealed, setRevealed] = useState(false);

  const styles = useStyleConfig('Copyable', {
    variant: isRevealed && sensitive ? 'sensitive' : 'default',
  });

  const handleExpand = () => {
    setExpanded(true);
  };

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleHide = () => {
    setExpanded(false);
    setRevealed(false);
  };

  if (sensitive && !isRevealed) {
    return (
      <Box __css={styles} cursor="pointer" onClick={handleReveal}>
        <Sensitive isRevealed={isRevealed} onHide={handleHide} />
        <Text flexGrow={1}>Reveal sensitive content</Text>
      </Box>
    );
  }

  return (
    <Box __css={styles}>
      {sensitive && <Sensitive isRevealed={isRevealed} onHide={handleHide} />}
      <Box width="100%" flexGrow={1} position="relative">
        <More
          onClick={handleExpand}
          isExpanded={isExpanded}
          sensitive={sensitive}
        >
          <Text fontSize="inherit" color="inherit" wordBreak="break-all">
            {value}
          </Text>
        </More>
      </Box>
      <Copy value={value} />
    </Box>
  );
};
