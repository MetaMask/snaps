import { createAccountList, createChainIdList } from './account';

describe('createAccountList', () => {
  it('creates an account list from an address and a list of chain IDs', () => {
    const result = createAccountList(
      '0x1234567890123456789012345678901234567890',
      ['eip155:1', 'eip155:2'],
    );

    expect(result).toStrictEqual([
      'eip155:1:0x1234567890123456789012345678901234567890',
      'eip155:2:0x1234567890123456789012345678901234567890',
    ]);
  });
});

describe('createChainIdList', () => {
  it('creates a chain ID list from account scopes and requested chain IDs', () => {
    const result = createChainIdList(
      ['eip155:1', 'eip155:2'],
      ['eip155:1', 'eip155:3'],
    );

    expect(result).toStrictEqual(['eip155:1']);
  });

  it('returns all account scopes if no requested chain IDs are provided', () => {
    const result = createChainIdList(['eip155:1', 'eip155:2']);

    expect(result).toStrictEqual(['eip155:1', 'eip155:2']);
  });

  it('returns all requested chain IDs if the scope represents all EVM compatible chains', () => {
    const result = createChainIdList(['eip155:0'], ['eip155:1', 'eip155:2']);

    expect(result).toStrictEqual(['eip155:1', 'eip155:2']);
  });

  it('returns "eip155:0" if the scope represents all EVM compatible chains', () => {
    const result = createChainIdList(['eip155:0']);

    expect(result).toStrictEqual(['eip155:0']);
  });
});
