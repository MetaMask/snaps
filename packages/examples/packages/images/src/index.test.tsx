import { expect } from '@jest/globals';
import { installSnap, assertIsAlertDialog } from '@metamask/snaps-jest';
import { Box, Text, Image } from '@metamask/snaps-sdk/jsx';
import { renderSVG } from 'uqr';

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

  describe('getQrCode', () => {
    it('generates a QR code for the given data', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getQrCode',
        params: {
          data: 'Hello, world!',
        },
      });

      const ui = await response.getInterface();
      assertIsAlertDialog(ui);

      expect(ui).toRender(
        <Box>
          <Text>
            The following is a QR code for the data "{'Hello, world!'}":
          </Text>
          <Image src={renderSVG('Hello, world!')} />
        </Box>,
      );

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });

  describe('getCat', () => {
    it('shows a cat using an external URL', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getCat',
      });

      const ui = await response.getInterface();
      assertIsAlertDialog(ui);

      expect(ui).toRender(
        <Box>
          <Text>Enjoy your cat!</Text>
          <Image src="https://cataas.com/cat" height={400} width={400} />
        </Box>,
      );

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });

  describe('getSvgIcon', () => {
    it('shows an SVG icon', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getSvgIcon',
      });

      const ui = await response.getInterface();
      assertIsAlertDialog(ui);

      // eslint-disable-next-line jest/prefer-strict-equal
      expect(ui.content).toEqual({
        type: 'Box',
        props: {
          children: [
            {
              type: 'Text',
              props: {
                children: 'Here is an SVG icon:',
              },
              key: null,
            },
            {
              type: 'Image',
              props: {
                src: expect.stringContaining('<svg'),
              },
              key: null,
            },
          ],
        },
        key: null,
      });

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });

  describe('getPngIcon', () => {
    it('shows a PNG icon', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getPngIcon',
      });

      const ui = await response.getInterface();
      assertIsAlertDialog(ui);

      // eslint-disable-next-line jest/prefer-strict-equal
      expect(ui.content).toEqual({
        type: 'Box',
        props: {
          children: [
            {
              type: 'Text',
              props: {
                children: 'Here is a PNG icon:',
              },
              key: null,
            },
            {
              type: 'Image',
              props: {
                src: expect.stringContaining('data:image/png;base64'),
              },
              key: null,
            },
          ],
        },
        key: null,
      });

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });
});
