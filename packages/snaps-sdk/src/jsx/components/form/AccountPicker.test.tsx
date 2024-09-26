import { AccountPicker } from './AccountPicker';

describe('AccountPicker', () => {
  it('returns an account picker element', () => {
    const result = (
      <AccountPicker
        name="account"
        title="From account"
        chainId="bip122:p2wpkh"
        selectedAddress="bc1qc8dwyqua9elc3mzcxk93c70kjz8tcc92x0a8a6"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountPicker',
      props: {
        name: 'account',
        title: 'From account',
        chainId: 'bip122:p2wpkh',
        selectedAddress: 'bc1qc8dwyqua9elc3mzcxk93c70kjz8tcc92x0a8a6',
      },
      key: null,
    });
  });
});
