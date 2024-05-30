import { AccountsSnapHandlerType } from './invoke-accounts-snap';

describe('AccountsSnapHandlerType', () => {
  it('has the correct values', () => {
    expect(Object.values(AccountsSnapHandlerType)).toHaveLength(2);
    expect(AccountsSnapHandlerType.Keyring).toBe('keyring');
    expect(AccountsSnapHandlerType.Chain).toBe('chain');
  });
});
