import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Heading, Icon } from '@metamask/snaps-sdk/jsx';

/**
 * A component that shows the send flow header.
 *
 * @returns The SendFlowHeader component.
 */
export const SendFlowHeader: SnapComponent = () => (
  <Box direction="horizontal" alignment="space-between" center>
    <Button name="back">
      <Icon name="arrow-left" color="primary" size="md" />
    </Button>
    <Heading>Send</Heading>
    <Button name="menu">
      <Icon name="more-vertical" color="primary" size="md" />
    </Button>
  </Box>
);
