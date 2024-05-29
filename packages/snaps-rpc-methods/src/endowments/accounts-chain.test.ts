import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import {
  getAccountsChainCaveatMapper,
  getAccountsChainCaveatOrigins,
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
      ).toThrow('Expected the following caveats: "keyringOrigin".');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "keyringOrigin", "maxRequestTime", received "foo".',
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

describe('getKeyringCaveatMapper', () => {
  it('maps a value to a caveat', () => {
    expect(
      getAccountsChainCaveatMapper({ allowedOrigins: ['foo.com'] }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.KeyringOrigin,
          value: { allowedOrigins: ['foo.com'] },
        },
      ],
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

  it('throws if the caveat is not a single "rpcOrigin"', () => {
    expect(() =>
      // @ts-expect-error Missing other required permission types.
      getAccountsChainCaveatOrigins({
        caveats: [{ type: 'foo', value: 'bar' }],
      }),
    ).toThrow('Assertion failed.');

    expect(() =>
      // @ts-expect-error Missing other required permission types.
      getAccountsChainCaveatOrigins({
        caveats: [
          { type: 'keyringOrigin', value: { allowedOrigins: ['foo.com'] } },
          { type: 'keyringOrigin', value: { allowedOrigins: ['foo.com'] } },
        ],
      }),
    ).toThrow('Assertion failed.');
  });
});
