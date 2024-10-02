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
      <AccountSelector name="account" switchGlobalAccount={true} />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        switchGlobalAccount: true,
      },
      key: null,
    });
  });

  it('returns an account selector element with a selectedAccount prop', () => {
    const result = (
      <AccountSelector
        name="account"
        selectedAccount="1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        selectedAccount: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
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
        switchGlobalAccount={true}
        selectedAccount="1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed"
      />
    );

    expect(result).toStrictEqual({
      type: 'AccountSelector',
      props: {
        name: 'account',
        chainIds: ['bip122:000000000019d6689c085ae165831e93'],
        hideExternalAccounts: true,
        switchGlobalAccount: true,
        selectedAccount: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
      },
      key: null,
    });
  });
});
