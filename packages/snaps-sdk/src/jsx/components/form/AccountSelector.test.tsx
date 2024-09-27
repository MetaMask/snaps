import { AccountSelector } from './AccountSelector';

describe('AccountSelector', () => {
  it('returns an account selector element', () => {
    const result = (
      <AccountSelector
        name="account"
        title="From account"
        chainId={['bip122:p2wpkh']}
        selectedAddress="bc1qc8dwyqua9elc3mzcxk93c70kjz8tcc92x0a8a6"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        title: 'From account',
        chainId: ['bip122:p2wpkh'],
        selectedAddress: 'bc1qc8dwyqua9elc3mzcxk93c70kjz8tcc92x0a8a6',
      },
      key: null,
    });
  });
});
