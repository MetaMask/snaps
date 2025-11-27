import { expect } from '@jest/globals';
import { assertIsCustomDialog, installSnap } from '@metamask/snaps-jest';

import {
  Insight,
  InteractiveForm,
  Result,
  TransactionType,
} from './components';

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

      const presentDate = new Date();

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const formScreen = await response.getInterface();

      expect(formScreen).toRender(<InteractiveForm />);

      await formScreen.typeInField('example-input', 'foobar');

      await formScreen.selectInDropdown('example-dropdown', 'option3');

      await formScreen.selectFromRadioGroup('example-radiogroup', 'option3');

      await formScreen.selectFromSelector('example-selector', 'option2');

      await formScreen.clickElement('example-checkbox');

      await formScreen.pickDateTime('example-datetime', presentDate);

      await formScreen.pickDateTime('example-date', pastDate);

      await formScreen.pickDateTime('example-time', futureDate);

      await formScreen.clickElement('submit');

      const resultScreen = await response.getInterface();
      assertIsCustomDialog(resultScreen);

      expect(resultScreen).toRender(
        <Result
          values={{
            'example-input': 'foobar',
            'example-dropdown': 'option3',
            'example-radiogroup': 'option3',
            'example-checkbox': true,
            'example-selector': 'option2',
            'example-datetime': presentDate.toISOString(),
            'example-date': pastDate.toISOString(),
            'example-time': futureDate.toISOString(),
          }}
        />,
      );
      await resultScreen.clickElement('ok');

      expect(await response).toRespondWith(null);
    });

    it('lets users input nothing', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'dialog',
      });

      const formScreen = await response.getInterface();

      expect(formScreen).toRender(<InteractiveForm />);

      await formScreen.clickElement('submit');

      const resultScreen = await response.getInterface();
      assertIsCustomDialog(resultScreen);

      expect(resultScreen).toRender(
        <Result
          values={{
            'example-input': '',
            'example-dropdown': 'option1',
            'example-radiogroup': 'option1',
            'example-checkbox': false,
            'example-selector': 'option1',
            'example-datetime': '',
            'example-date': '',
            'example-time': '',
          }}
        />,
      );
      await resultScreen.clickElement('ok');

      expect(await response).toRespondWith(null);
    });
  });
});

describe('onHomePage', () => {
  it('returns custom UI', async () => {
    const presentDate = new Date();

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    const pastDate = new Date();
    pastDate.setFullYear(pastDate.getFullYear() - 1);

    const { onHomePage } = await installSnap();

    const response = await onHomePage();

    const formScreen = response.getInterface();

    expect(formScreen).toRender(<InteractiveForm />);

    await formScreen.typeInField('example-input', 'foobar');

    await formScreen.selectInDropdown('example-dropdown', 'option3');

    await formScreen.selectFromRadioGroup('example-radiogroup', 'option3');

    await formScreen.selectFromSelector('example-selector', 'option2');

    await formScreen.pickDateTime('example-datetime', presentDate);

    await formScreen.pickDateTime('example-date', pastDate);

    await formScreen.pickDateTime('example-time', futureDate);

    await formScreen.clickElement('submit');

    const resultScreen = response.getInterface();

    expect(resultScreen).toRender(
      <Result
        values={{
          'example-input': 'foobar',
          'example-dropdown': 'option3',
          'example-radiogroup': 'option3',
          'example-checkbox': false,
          'example-selector': 'option2',
          'example-datetime': presentDate.toISOString(),
          'example-date': pastDate.toISOString(),
          'example-time': futureDate.toISOString(),
        }}
      />,
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
      <Insight from={FROM_ADDRESS} to={TO_ADDRESS} />,
    );

    await startScreen.clickElement('transaction-type');

    const txTypeScreen = response.getInterface();

    expect(txTypeScreen).toRender(<TransactionType type="ERC-20" />);
  });
});
