import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

export const Unsupported: SnapComponent = () => (
  <Box>
    <Heading>Unsupported</Heading>
    <Text>Ledger hardware wallets are not supported in this browser.</Text>
  </Box>
);
