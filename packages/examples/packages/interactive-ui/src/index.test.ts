import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import {
  ButtonType,
  address,
  button,
  copyable,
  form,
  heading,
  input,
  panel,
  row,
  text,
} from '@metamask/snaps-sdk';
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

  describe('dialog', () => {
    it('creates a new Snap interface and use it in a confirmation dialog', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const startScreen = await response.getInterface();
      assert(startScreen.type === 'confirmation');

      expect(startScreen).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          button({ value: 'Update UI', name: 'update' }),
        ]),
      );

      await startScreen.clickElement('update');

      const formScreen = await response.getInterface();

      expect(formScreen).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          form({
            name: 'example-form',
            children: [
              input({
                name: 'example-input',
                placeholder: 'Enter something...',
              }),
              button('Submit', ButtonType.Submit, 'submit'),
            ],
          }),
        ]),
      );

      await formScreen.typeInField('example-input', 'foobar');

      await formScreen.clickElement('submit');

      const resultScreen = await response.getInterface();

      expect(resultScreen).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          text('The submitted value is:'),
          copyable('foobar'),
        ]),
      );
      await resultScreen.ok();

      expect(await response).toRespondWith(true);
    });

    it('lets users input nothing', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const startScreen = await response.getInterface();
      assert(startScreen.type === 'confirmation');

      expect(startScreen).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          button({ value: 'Update UI', name: 'update' }),
        ]),
      );

      await startScreen.clickElement('update');

      const formScreen = await response.getInterface();

      expect(formScreen).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          form({
            name: 'example-form',
            children: [
              input({
                name: 'example-input',
                placeholder: 'Enter something...',
              }),
              button('Submit', ButtonType.Submit, 'submit'),
            ],
          }),
        ]),
      );

      await formScreen.clickElement('submit');

      const resultScreen = await response.getInterface();

      expect(resultScreen).toRender(
        panel([
          heading('Interactive UI Example Snap'),
          text('The submitted value is:'),
          copyable(''),
        ]),
      );
      await resultScreen.ok();

      expect(await response).toRespondWith(true);
    });
  });

  describe('getState', () => {
    it('gets the interface state', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const ui = await response.getInterface();

      const getStateResponse = await request({
        method: 'getState',
      });

      await ui.ok();

      expect(getStateResponse).toRespondWith({});
    });
  });
});

describe('onHomePage', () => {
  it('returns custom UI', async () => {
    const { onHomePage } = await installSnap();

    const response = await onHomePage();

    const startScreen = response.getInterface();

    expect(startScreen).toRender(
      panel([
        heading('Interactive UI Example Snap'),
        button({ value: 'Update UI', name: 'update' }),
      ]),
    );

    await startScreen.clickElement('update');

    const formScreen = response.getInterface();

    expect(formScreen).toRender(
      panel([
        heading('Interactive UI Example Snap'),
        form({
          name: 'example-form',
          children: [
            input({
              name: 'example-input',
              placeholder: 'Enter something...',
            }),
            button('Submit', ButtonType.Submit, 'submit'),
          ],
        }),
      ]),
    );

    await formScreen.typeInField('example-input', 'foobar');

    await formScreen.clickElement('submit');

    const resultScreen = response.getInterface();

    expect(resultScreen).toRender(
      panel([
        heading('Interactive UI Example Snap'),
        text('The submitted value is:'),
        copyable('foobar'),
      ]),
    );
  });
});

describe('onTransaction', () => {
  const FROM_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
  const TO_ADDRESS = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520';
  it('returns custom UI', async () => {
    const { onTransaction } = await installSnap();

    const response = await onTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-20 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    const startScreen = response.getInterface();

    expect(startScreen).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        button({ value: 'See transaction type', name: 'transaction-type' }),
      ]),
    );

    await startScreen.clickElement('transaction-type');

    const txTypeScreen = response.getInterface();

    expect(txTypeScreen).toRender(
      panel([
        row('Transaction type', text('ERC-20')),
        button({ value: 'Go back', name: 'go-back' }),
      ]),
    );
  });
});
