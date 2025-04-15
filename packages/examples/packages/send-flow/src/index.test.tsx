import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

import { SendFlow } from './components';
import { accountsArray } from './data';

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

  describe('display', () => {
    it('shows a custom dialog with the SendFlow interface', async () => {
      const { request } = await installSnap();

      const response = request({
        method: 'display',
      });

      const sendFlowInterface = await response.getInterface();

      expect(sendFlowInterface).toRender(
        <SendFlow
          accounts={accountsArray}
          selectedAccount={accountsArray[0].address}
          selectedCurrency="BTC"
          total={{ amount: 0, fiat: 0 }}
          fees={{ amount: 1.0001, fiat: 1.23 }}
        />,
      );
    });
  });
});

describe('onHomePage', () => {
  it('returns a custom UI', async () => {
    const { onHomePage } = await installSnap();

    const response = await onHomePage();

    const sendFlowInterface = response.getInterface();

    expect(sendFlowInterface).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[0].address}
        selectedCurrency="BTC"
        total={{ amount: 0, fiat: 0 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
      />,
    );
  });
});

describe('onUserInput', () => {
  it('handles account selection', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'display',
    });

    const sendFlowInterface = await response.getInterface();

    await sendFlowInterface.selectFromSelector(
      'accountSelector',
      accountsArray[1].address,
    );

    const updatedInterface = await response.getInterface();

    expect(updatedInterface).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[1].address}
        selectedCurrency="BTC"
        total={{ amount: 1.0001, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{}}
        displayAvatar={false}
      />,
    );
  });

  it('handles amount input', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'display',
    });

    const sendFlowInterface = await response.getInterface();

    await sendFlowInterface.typeInField('amount', '0.5');

    const updatedInterface = await response.getInterface();

    expect(updatedInterface).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[0].address}
        selectedCurrency="BTC"
        total={{ amount: 1.5001, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{}}
        displayAvatar={false}
      />,
    );
  });

  it('handles to input', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'display',
    });

    const sendFlowInterface = await response.getInterface();

    await sendFlowInterface.typeInField(
      'to',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    );

    const updatedInterface = await response.getInterface();

    expect(updatedInterface).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[0].address}
        selectedCurrency="BTC"
        total={{ amount: 1.0001, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{}}
        displayAvatar={true}
      />,
    );
  });

  it('handles invalid input', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'display',
    });

    const sendFlowInterface = await response.getInterface();

    await sendFlowInterface.typeInField('amount', '2');

    const updatedInterface = await response.getInterface();

    expect(updatedInterface).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[0].address}
        selectedCurrency="BTC"
        total={{ amount: 3.0000999999999998, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{ amount: 'Insufficient funds' }}
        displayAvatar={false}
      />,
    );
  });

  it('maintains state across multiple interactions', async () => {
    const { request } = await installSnap();

    const response = request({
      method: 'display',
    });

    const sendFlowInterface = await response.getInterface();

    await sendFlowInterface.selectFromSelector(
      'accountSelector',
      accountsArray[1].address,
    );

    await sendFlowInterface.typeInField('amount', '0.5');

    const updatedInterface = await response.getInterface();

    expect(updatedInterface).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[1].address}
        selectedCurrency="BTC"
        total={{ amount: 1.5001, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{}}
        displayAvatar={false}
      />,
    );

    await sendFlowInterface.typeInField(
      'to',
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    );

    const updatedInterface2 = await response.getInterface();

    expect(updatedInterface2).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[1].address}
        selectedCurrency="BTC"
        total={{ amount: 1.5001, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{}}
        displayAvatar={true}
      />,
    );

    await sendFlowInterface.typeInField('amount', '0');

    const updatedInterface3 = await response.getInterface();

    expect(updatedInterface3).toRender(
      <SendFlow
        accounts={accountsArray}
        selectedAccount={accountsArray[1].address}
        selectedCurrency="BTC"
        total={{ amount: 1.0001, fiat: 251.23 }}
        fees={{ amount: 1.0001, fiat: 1.23 }}
        errors={{}}
        displayAvatar={true}
      />,
    );
  });
});
