import { Box } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { CopyIcon, CopySuccessIcon } from '../../../icons';

/**
 * The props for the {@link Copy} component.
 */
export type CopyProps = {
  /**
   * The value to write to the clipboard.
   */
  value: string;
};

/**
 * A copy icon, that writes the value to the clipboard when clicked.
 *
 * @param props - The component props.
 * @param props.value - The value to write to the clipboard.
 * @returns The copy element.
 */
export const Copy: FunctionComponent<CopyProps> = ({ value }) => {
  const [isCopied, setCopied] = useState(false);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
      })
      .catch(() => {
        // noop
      });
  };

  return (
    <Box cursor="pointer" onClick={handleCopy}>
      {isCopied ? <CopySuccessIcon /> : <CopyIcon />}
    </Box>
  );
};
