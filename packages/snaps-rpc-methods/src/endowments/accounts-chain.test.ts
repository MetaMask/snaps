import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import {
  getAccountsChainCaveatMapper,
  getAccountsChainCaveatOrigins,
  getAccountsChainCaveatChainIds,
  accountsChainEndowmentBuilder,
} from './accounts-chain';
import { SnapEndowments } from './enum';

describe('endowment:accounts-chain', () => {
  it('builds the expected permission specification', () => {
    const specification = accountsChainEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.AccountsChain,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [
        SnapCaveatType.KeyringOrigin,
        SnapCaveatType.ChainIds,
        SnapCaveatType.MaxRequestTime,
      ],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "keyringOrigin"', () => {
      const specification = accountsChainEndowmentBuilder.specificationBuilder(
        {},
      );

      expect(() =>
        specification.validator({
          // @ts-expect-error Missing other required permission types.
          caveats: undefined,
        }),
      ).toThrow('Expected the following caveats: "keyringOrigin", "chainIds".');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "keyringOrigin", "chainIds", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'keyringOrigin', value: { allowedOrgins: ['foo.com'] } },
            { type: 'keyringOrigin', value: { allowedOrgins: ['bar.com'] } },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getAccountsChainCaveatMapper', () => {
  it('maps a value to a caveat', () => {
    expect(
      getAccountsChainCaveatMapper({
        allowedOrigins: ['foo.com'],
        chains: ['bip122:000000000019d6689c085ae165831e93'],
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.ChainIds,
          value: ['bip122:000000000019d6689c085ae165831e93'],
        },
        {
          type: SnapCaveatType.KeyringOrigin,
          value: { allowedOrigins: ['foo.com'] },
        },
      ],
    });
  });

  it('returns null if the input is null', () => {
    expect(getAccountsChainCaveatMapper(null)).toStrictEqual({
      caveats: null,
    });
  });
});

describe('getAccountsChainCaveatOrigins', () => {
  it('returns the origins from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getAccountsChainCaveatOrigins({
        caveats: [
          {
            type: SnapCaveatType.KeyringOrigin,
            value: { allowedOrigins: ['foo.com'] },
          },
        ],
      }),
    ).toStrictEqual({ allowedOrigins: ['foo.com'] });
  });
});

describe('getAccountsChainCaveatChainIds', () => {
  it('returns the chain ids from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getAccountsChainCaveatChainIds({
        caveats: [
          {
            type: SnapCaveatType.ChainIds,
            value: ['bip122:000000000019d6689c085ae165831e93'],
          },
        ],
      }),
    ).toStrictEqual(['bip122:000000000019d6689c085ae165831e93']);
  });
});
