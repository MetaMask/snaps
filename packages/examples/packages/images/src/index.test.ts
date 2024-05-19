import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { DialogType, image, panel, text } from '@metamask/snaps-sdk';
import { renderSVG } from 'uqr';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request, close } = await installSnap();

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

    await close();
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
      expect(ui).toRender(
        panel([
          text(`The following is a QR code for the data "Hello, world!":`),
          image(renderSVG('Hello, world!')),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });

  describe('getCat', () => {
    // This test is flaky, so we disable it for now.
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('shows a cat', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'getCat',
      });

      const ui = await response.getInterface();
      expect(ui).toStrictEqual(
        expect.objectContaining({
          type: DialogType.Alert,
          content: {
            type: 'panel',
            children: [
              {
                type: 'text',
                value: 'Enjoy your cat!',
              },
              {
                type: 'image',
                value: expect.any(String),
              },
            ],
          },
        }),
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
