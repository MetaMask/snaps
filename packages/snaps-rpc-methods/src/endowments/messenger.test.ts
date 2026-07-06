import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from './enum';
import {
  getMessengerCaveatMapper,
  messengerCaveatSpecifications,
  messengerEndowmentBuilder,
  getMessengerCaveatActions,
} from './messenger';

describe('endowment:messenger', () => {
  it('builds the expected permission specification', () => {
    const specification = messengerEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.Messenger,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [SnapCaveatType.MessengerScopes],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeNull();
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "messengerScopes"', () => {
      const specification = messengerEndowmentBuilder.specificationBuilder({});

      expect(() =>
        specification.validator({
          // @ts-expect-error Missing other required permission types.
          caveats: undefined,
        }),
      ).toThrow('Expected the following caveats: "messengerScopes".');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "messengerScopes", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: SnapCaveatType.MessengerScopes, value: 'bar' },
            { type: SnapCaveatType.MessengerScopes, value: 'bar' },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getMessengerCaveatMapper', () => {
  it('maps a value to a caveat', () => {
    expect(
      getMessengerCaveatMapper({
        actions: ['Foo:bar'],
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.MessengerScopes,
          value: {
            actions: ['Foo:bar'],
          },
        },
      ],
    });
  });

  it('returns null if value is empty', () => {
    expect(getMessengerCaveatMapper({})).toStrictEqual({ caveats: null });
  });
});

describe('getMessengerCaveatActions', () => {
  it('returns the actions from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getMessengerCaveatActions({
        caveats: [
          {
            type: SnapCaveatType.MessengerScopes,
            value: { actions: ['Foo:bar'] },
          },
        ],
      }),
    ).toStrictEqual(['Foo:bar']);
  });

  it('returns null if no caveat found', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getMessengerCaveatActions({
        caveats: null,
      }),
    ).toBeNull();
  });
});

describe('messengerCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        messengerCaveatSpecifications[
          SnapCaveatType.MessengerScopes
        ].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.MessengerScopes,
          },
        ),
      ).toThrow('Expected an object.');

      expect(() =>
        messengerCaveatSpecifications[
          SnapCaveatType.MessengerScopes
        ].validator?.({
          type: SnapCaveatType.MessengerScopes,
          value: {
            foo: 'bar',
          },
        }),
      ).toThrow(
        'Invalid messenger scopes specified: At path: foo -- Expected a value of type `never`, but received: `"bar"`',
      );

      expect(() =>
        messengerCaveatSpecifications[
          SnapCaveatType.MessengerScopes
        ].validator?.({
          type: SnapCaveatType.MessengerScopes,
          value: {
            actions: [],
          },
        }),
      ).toThrow(
        'Invalid messenger scopes specified: At path: actions -- Expected a array with a length between `1` and `Infinity` but received one with a length of `0`.',
      );
    });
  });
});
