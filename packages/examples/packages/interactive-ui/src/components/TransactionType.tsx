import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Bold, Box, Row, Button, Text } from '@metamask/snaps-sdk/jsx';

type TransactionTypeProps = {
  type: string;
};

export const TransactionType: SnapComponent<TransactionTypeProps> = ({
  type,
}) => {
  return (
    <Box>
      <Row label="Transaction Type">
        <Text>
          <Bold>{type}</Bold>
        </Text>
      </Row>
      <Button name="go-back">Back</Button>
    </Box>
  );
};
