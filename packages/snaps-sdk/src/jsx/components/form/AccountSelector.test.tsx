import { AccountSelector } from './AccountSelector';

describe('AccountSelector', () => {
  it('returns an account selector element', () => {
    const result = (
      <AccountSelector
        name="account"
        chainIds={['bip122:p2wpkh']}
        selectedAccount="1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        chainIds: ['bip122:p2wpkh'],
        selectedAccount: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
      },
      key: null,
    });
  });
});
