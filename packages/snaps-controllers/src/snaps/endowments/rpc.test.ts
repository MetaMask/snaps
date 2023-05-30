import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from '.';
import {
  getRpcCaveatMapper,
  getRpcCaveatOrigins,
  rpcCaveatSpecifications,
  rpcEndowmentBuilder,
} from './rpc';

describe('endowment:rpc', () => {
  it('builds the expected permission specification', () => {
    const specification = rpcEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.Rpc,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [SnapCaveatType.RpcOrigin],
      validator: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "rpcOrigin"', () => {
      const specification = rpcEndowmentBuilder.specificationBuilder({});

      expect(() =>
        specification.validator({
          // @ts-expect-error Missing other required permission types.
          caveats: undefined,
        }),
      ).toThrow('Expected a single "rpcOrigin" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "rpcOrigin" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'rpcOrigin', value: { snaps: true, dapps: false } },
            { type: 'rpcOrigin', value: { snaps: true, dapps: false } },
          ],
        }),
      ).toThrow('Expected a single "rpcOrigin" caveat.');
    });
  });
});

describe('getRpcCaveatMapper', () => {
  it('maps a value to a caveat', () => {
    expect(getRpcCaveatMapper({ snaps: true, dapps: false })).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.RpcOrigin,
          value: { snaps: true, dapps: false },
        },
      ],
    });
  });
});

describe('getRpcCaveatOrigins', () => {
  it('returns the origins from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getRpcCaveatOrigins({
        caveats: [
          {
            type: SnapCaveatType.RpcOrigin,
            value: { snaps: true, dapps: false },
          },
        ],
      }),
    ).toStrictEqual({ snaps: true, dapps: false });
  });

  it('throws if the caveat is not a single "rpcOrigin"', () => {
    expect(() =>
      // @ts-expect-error Missing other required permission types.
      getRpcCaveatOrigins({
        caveats: [{ type: 'foo', value: 'bar' }],
      }),
    ).toThrow('Assertion failed.');

    expect(() =>
      // @ts-expect-error Missing other required permission types.
      getRpcCaveatOrigins({
        caveats: [
          { type: 'rpcOrigin', value: { snaps: true, dapps: false } },
          { type: 'rpcOrigin', value: { snaps: true, dapps: false } },
        ],
      }),
    ).toThrow('Assertion failed.');
  });
});

describe('rpcCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        rpcCaveatSpecifications[SnapCaveatType.RpcOrigin].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.TransactionOrigin,
          },
        ),
      ).toThrow('Invalid JSON-RPC origins: Expected a plain object.');

      expect(() =>
        rpcCaveatSpecifications[SnapCaveatType.RpcOrigin].validator?.({
          type: SnapCaveatType.TransactionOrigin,
          value: {
            foo: 'bar',
          },
        }),
      ).toThrow(
        'Invalid JSON-RPC origins: At path: foo -- Expected a value of type `never`, but received: `"bar"`.',
      );
    });
  });
});
