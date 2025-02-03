import { AccountSelector } from './AccountSelector';

describe('AccountSelector', () => {
  it('returns an account selector element without filter props', () => {
    const result = <AccountSelector name="account" />;

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
      },
      key: null,
    });
  });

  it('returns an account selector element with the chainIds filter prop', () => {
    const result = (
      <AccountSelector
        name="account"
        chainIds={['bip122:000000000019d6689c085ae165831e93']}
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        chainIds: ['bip122:000000000019d6689c085ae165831e93'],
      },
      key: null,
    });
  });

  it('returns an account selector element with the hideExternalAccounts filter prop', () => {
    const result = (
      <AccountSelector name="account" hideExternalAccounts={true} />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        hideExternalAccounts: true,
      },
      key: null,
    });
  });

  it('returns an account selector element with the switchGlobalAccount filter prop', () => {
    const result = (
      <AccountSelector name="account" switchSelectedAccount={true} />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        switchSelectedAccount: true,
      },
      key: null,
    });
  });

  it('returns an account selector element with a selectedAccount prop', () => {
    const result = (
      <AccountSelector
        name="account"
        selectedAddress="eip155:1:0x1234567890abcdef1234567890abcdef12345678"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        selectedAddress: 'eip155:1:0x1234567890abcdef1234567890abcdef12345678',
      },
      key: null,
    });
  });

  it('returns an account selector element with all props', () => {
    const result = (
      <AccountSelector
        name="account"
        chainIds={['bip122:000000000019d6689c085ae165831e93']}
        hideExternalAccounts={true}
        switchSelectedAccount={true}
        selectedAddress="bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        chainIds: ['bip122:000000000019d6689c085ae165831e93'],
        hideExternalAccounts: true,
        switchSelectedAccount: true,
        selectedAddress:
          'bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6',
      },
      key: null,
    });
  });
});
