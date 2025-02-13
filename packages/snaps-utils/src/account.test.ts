import { createAccountList } from './account';

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
