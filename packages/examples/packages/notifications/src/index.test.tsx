import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { NotificationType } from '@metamask/snaps-sdk';
import { Address, Box, Row } from '@metamask/snaps-sdk/jsx';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    });
  });

  describe('inApp', () => {
    it('sends an in-app notification', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'inApp',
        origin: 'Jest',
      });

      expect(response).toRespondWith(null);
      expect(response).toSendNotification(
        'Hello from within MetaMask! [This](https://snaps.metamask.io/) is a what a link looks like.',
        NotificationType.InApp,
      );
    });
  });

  describe('inApp-expanded', () => {
    it('sends an expanded view notification', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'inApp-expanded',
        origin: 'Jest',
      });

      expect(response).toRespondWith(null);
      expect(response).toSendNotification(
        'Hello from MetaMask, click here for an expanded view!',
        NotificationType.InApp,
        'Hello World!',
        <Box>
          <Row
            label="From"
            variant="warning"
            tooltip="This address has been deemed dangerous."
          >
            <Address address="0x1234567890123456789012345678901234567890" />
          </Row>
        </Box>,
        { text: 'Go home', href: 'metamask://client/' },
      );
    });
  });

  describe('native', () => {
    it('sends a native notification', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'native',
        origin: 'Jest',
      });

      expect(response).toRespondWith(null);
      expect(response).toSendNotification(
        'Hello from the browser!',
        NotificationType.Native,
      );
    });
  });
});
