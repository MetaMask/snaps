import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Heading } from '@metamask/snaps-sdk/jsx';

export const ConnectHID: SnapComponent = () => (
  <Box>
    <Heading>Connect with HID</Heading>
    <Button name="connect-hid">Connect</Button>
  </Box>
);
