import { Box, Button, Flex } from '@chakra-ui/react';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { FunctionComponent } from 'react';

import { Renderer } from '../../features/renderer';
import { Delineator, DelineatorType } from '../Delineator';
import { Window } from '../Window';

export type ConfirmationDialogProps = {
  snapName: string;
  snapId: string;
  content: JSXElement;
  onCancel?: () => void;
  onApprove?: () => void;
};

/**
 * Snap confirmation dialog.
 *
 * @param props - The component props.
 * @param props.snapName - The snap name.
 * @param props.snapId - The snap ID.
 * @param props.content - The component to render.
 * @param props.onCancel - The cancel callback.
 * @param props.onApprove - The approve callback.
 * @returns The component.
 */
export const ConfirmationDialog: FunctionComponent<ConfirmationDialogProps> = ({
  snapName,
  snapId,
  content,
  onCancel,
  onApprove,
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
      <Button variant="outline" flex="1" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="primary" flex="1" onClick={onApprove}>
        Approve
      </Button>
    </Flex>
  </Window>
);
