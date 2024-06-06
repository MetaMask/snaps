import { Box, Button, Flex } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { Renderer } from '../../features/renderer';
import { Delineator, DelineatorType } from '../Delineator';
import { Window } from '../Window';

export type AlertDialogProps = {
  snapName: string;
  snapId: string;
  content: JSXElement;
  onClose?: () => void;
};

/**
 * Snap alert dialog.
 *
 * @param props - The component props.
 * @param props.snapName - The snap name.
 * @param props.snapId - The snap ID.
 * @param props.content - The component to render.
 * @param props.onClose - The close callback.
 * @returns The component.
 */
export const AlertDialog: FunctionComponent<AlertDialogProps> = ({
  snapName,
  snapId,
  content,
  onClose,
}) => (
  <Window snapName={snapName} snapId={snapId}>
    <Box margin="4" marginTop="0" flex="1">
      <Delineator type={DelineatorType.Content} snapName={snapName}>
        <Renderer content={content} />
      </Delineator>
    </Box>
    <Flex
      borderTop="1px solid"
      borderTopColor="border.default"
      paddingTop="4"
      paddingX="4"
      gap="4"
    >
      <Button variant="primary" flex="1" onClick={onClose}>
        OK
      </Button>
    </Flex>
  </Window>
);
