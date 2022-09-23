import { PermissionType } from '@metamask/controllers';
import { SnapCaveatType } from '@metamask/snap-utils';
import { SnapEndowments } from './enum';
import {
  keyringCaveatSpecifications,
  keyringEndowmentBuilder,
} from './keyring';

describe('specificationBuilder', () => {
  const specification = keyringEndowmentBuilder.specificationBuilder({});

  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.Keyring,
      allowedCaveats: [SnapCaveatType.SnapKeyring],
      endowmentGetter: expect.any(Function),
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "snapKeyring"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "snapKeyring" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "snapKeyring" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'snapKeyring', value: [] },
            { type: 'snapKeyring', value: [] },
          ],
        }),
      ).toThrow('Expected a single "snapKeyring" caveat.');
    });
  });
});

describe('keyringCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        // @ts-expect-error Missing value type.
        keyringCaveatSpecifications[SnapCaveatType.SnapKeyring].validator?.({
          type: SnapCaveatType.SnapKeyring,
        }),
      ).toThrow('Expected a plain object.');

      expect(() =>
        keyringCaveatSpecifications[SnapCaveatType.SnapKeyring].validator?.({
          type: SnapCaveatType.SnapKeyring,
          value: {
            namespaces: undefined,
          },
        }),
      ).toThrow('Expected a valid namespaces object.');
    });
  });
});
