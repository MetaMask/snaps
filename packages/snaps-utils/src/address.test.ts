import { createAddressList } from './address';

describe('createAddressList', () => {
  it('creates an address list from an account', () => {
    const result = createAddressList(
      '0x1234567890123456789012345678901234567890',
      ['eip155:1', 'eip155:2'],
    );

    expect(result).toStrictEqual([
      'eip155:1:0x1234567890123456789012345678901234567890',
      'eip155:2:0x1234567890123456789012345678901234567890',
    ]);
  });
});
