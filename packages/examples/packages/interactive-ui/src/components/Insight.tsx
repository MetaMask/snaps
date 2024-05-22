import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Button, Box, Text, Row, Address } from '@metamask/snaps-sdk/jsx';

type InsightProps = {
  from: string;
  to?: string;
};

export const Insight: SnapComponent<InsightProps> = ({ from, to }) => {
  return (
    <Box>
      <Row label="From">
        <Address address={from as `0x${string}`} />
      </Row>
      <Row label="To">
        {to ? <Address address={from as `0x${string}`} /> : <Text>None</Text>}
      </Row>
      <Button name="transaction-type">See transaction type</Button>
    </Box>
  );
};
