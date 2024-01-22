import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { heading, panel, text } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

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

  describe('showAlert', () => {
    it('shows an alert dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showAlert',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'alert');

      expect(ui).toRender(
        panel([
          heading('Alert Dialog'),
          text('This is an alert dialog. It has a single button: "OK".'),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(null);
    });
  });

  describe('showConfirmation', () => {
    it('shows a confirmation dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showConfirmation',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'confirmation');

      expect(ui).toRender(
        panel([
          heading('Confirmation Dialog'),
          text(
            'This is a confirmation dialog. It has two buttons: "OK" and "Cancel," letting the user choose whether to proceed with an action. [That](https://snaps.metamask.io/) is a what a link looks like.',
          ),
        ]),
      );

      await ui.ok();

      expect(await response).toRespondWith(true);
    });

    it('responds with false when clicking cancel', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showConfirmation',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'confirmation');
      await ui.cancel();

      expect(await response).toRespondWith(false);
    });
  });

  describe('showPrompt', () => {
    it('shows a prompt dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showPrompt',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'prompt');

      expect(ui).toRender(
        panel([
          heading('Prompt Dialog'),
          text(
            'This is a prompt dialog. In addition to the "OK" and "Cancel" buttons, it has a text input field.',
          ),
        ]),
      );

      await ui.ok('Hello, world!');

      expect(await response).toRespondWith('Hello, world!');
    });

    it('responds with null when clicking cancel', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'showPrompt',
      });

      const ui = await response.getInterface();
      assert(ui.type === 'prompt');
      await ui.cancel();

      expect(await response).toRespondWith(null);
    });
  });
});
