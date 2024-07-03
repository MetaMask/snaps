import type { ButtonProps } from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import type { FunctionComponent } from 'react';

export type CancelButtonProps = ButtonProps;

/**
 * A cancel button.
 *
 * @param props - The button props.
 * @param props.children - The button label.
 * @returns The cancel button element.
 */
export const CancelButton: FunctionComponent<CancelButtonProps> = (props) => {
  return (
    <Button flexBasis={0} flexGrow={1} maxWidth="auto" size="large" {...props}>
      Cancel
    </Button>
  );
};
