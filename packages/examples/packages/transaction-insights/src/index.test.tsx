import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { Address, Box, Row, Text } from '@metamask/snaps-sdk/jsx';

describe('onTransaction', () => {
  const FROM_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
  const TO_ADDRESS = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520';

  it('returns transaction insights for an ERC-20 transaction', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-20 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Row label="From">
          <Address address={FROM_ADDRESS} />
        </Row>
        <Row label="To">
          <Address address={TO_ADDRESS} />
        </Row>
        <Row label="Transaction type">
          <Text>ERC-20</Text>
        </Row>
      </Box>,
    );
  });

  it('returns transaction insights for an ERC-721 transaction', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-721 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0x23b872dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Row label="From">
          <Address address={FROM_ADDRESS} />
        </Row>
        <Row label="To">
          <Address address={TO_ADDRESS} />
        </Row>
        <Row label="Transaction type">
          <Text>ERC-721</Text>
        </Row>
      </Box>,
    );
  });

  it('returns transaction insights for an ERC-1155 transaction', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-1155 transfer as all the values are zero, but
      // it is enough to test the `onTransaction` handler.
      data: '0xf242432a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Row label="From">
          <Address address={FROM_ADDRESS} />
        </Row>
        <Row label="To">
          <Address address={TO_ADDRESS} />
        </Row>
        <Row label="Transaction type">
          <Text>ERC-1155</Text>
        </Row>
      </Box>,
    );
  });

  it('returns transaction insights for an unknown transaction', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      data: '0xabcdef1200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Row label="From">
          <Address address={FROM_ADDRESS} />
        </Row>
        <Row label="To">
          <Address address={TO_ADDRESS} />
        </Row>
        <Row label="Transaction type">
          <Text>Unknown</Text>
        </Row>
      </Box>,
    );
  });

  it('returns transaction insights for a transaction with no data', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      data: '0x',
    });

    const screen = response.getInterface();

    expect(screen).toRender(
      <Box>
        <Row label="From">
          <Address address={FROM_ADDRESS} />
        </Row>
        <Row label="To">
          <Address address={TO_ADDRESS} />
        </Row>
        <Row label="Transaction type">
          <Text>Unknown</Text>
        </Row>
      </Box>,
    );
  });
});
