import { is } from '@metamask/superstruct';

import { MatchingAddressesCaipAccountIdListStruct } from './caip';

describe('MatchingAddressesCaipAccountIdListStruct', () => {
  it('validates an array of matchin addresses', () => {
    expect(
      is(
        [
          'eip155:1:0x1234567890123456789012345678901234567890',
          'eip155:2:0x1234567890123456789012345678901234567890',
          'eip155:3:0x1234567890123456789012345678901234567890',
        ],
        MatchingAddressesCaipAccountIdListStruct,
      ),
    ).toBe(true);
  });

  it("doesn't validate an array of mismatching addresses", () => {
    expect(
      is(
        [
          'eip155:1:0x1234567890123456789012345678901234567890',
          'eip155:2:0x1234567890123456789012225678901234567890',
          'eip155:3:0x1234567890123456789012345678901234567890',
        ],
        MatchingAddressesCaipAccountIdListStruct,
      ),
    ).toBe(false);
  });

  it("doesn't validate an array of mismatching chain namespaces", () => {
    expect(
      is(
        [
          'eip155:1:0x1234567890123456789012345678901234567890',
          'eip155:2:0x1234567890123456789012345678901234567890',
          'foo:3:0x1234567890123456789012345678901234567890',
        ],
        MatchingAddressesCaipAccountIdListStruct,
      ),
    ).toBe(false);
  });
});
