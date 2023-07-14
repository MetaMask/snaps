import type { Caveat, OriginString } from '@metamask/permission-controller';
import type { SnapId } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID, MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';
import type { Json } from '@metamask/utils';

import {
  validateSnapIdsCaveat,
  SnapIdsCaveatSpecification,
  snapIdsCaveatMapper,
} from './snapIds';

describe('snapIdsCaveatMapper', () => {
  it('returns a caveat value for an array of paths', () => {
    expect(
      snapIdsCaveatMapper({
        MOCK_SNAP_ID: { version: '2.1.0' },
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.SnapIds,
          value: {
            MOCK_SNAP_ID: { version: '2.1.0' },
          },
        },
      ],
    });
  });
});

describe('validateSnapIdsCaveats', () => {
  it('validates that a caveat has a non-empty snap IDs object as a caveat value', () => {
    const validCaveat1 = {
      type: SnapCaveatType.SnapIds,
      value: { [MOCK_SNAP_ID]: {} },
    };
    const validCaveat2 = {
      type: SnapCaveatType.SnapIds,
      value: { [MOCK_SNAP_ID]: { version: '1.0.0' } },
    };
    const missingValueCaveat = {
      type: SnapCaveatType.SnapIds,
    };
    const emptyValueCaveat = {
      type: SnapCaveatType.SnapIds,
      value: {},
    };
    const invalidSnapValueCaveat = {
      type: SnapCaveatType.SnapIds,
      value: { [MOCK_SNAP_ID]: 'foobar' },
    };
    const invalidVersionCaveat = {
      type: SnapCaveatType.SnapIds,
      value: { [MOCK_SNAP_ID]: { version: '2.0.0.0' } },
    };
    expect(() => validateSnapIdsCaveat(validCaveat1)).not.toThrow();
    expect(() => validateSnapIdsCaveat(validCaveat2)).not.toThrow();
    expect(() =>
      validateSnapIdsCaveat(missingValueCaveat as Caveat<string, Json>),
    ).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.',
    );
    expect(() => validateSnapIdsCaveat(emptyValueCaveat)).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.',
    );
    expect(() => validateSnapIdsCaveat(invalidSnapValueCaveat)).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.: At path: value.npm:@metamask/example-snap -- Expected an object, but received: "foobar".',
    );
    expect(() => validateSnapIdsCaveat(invalidVersionCaveat)).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.: At path: value.npm:@metamask/example-snap.version -- Expected a valid SemVer range.',
    );
  });
});

describe('SnapIdsCaveatSpecification', () => {
  describe('validator', () => {
    it('throws for an invalid caveat object', () => {
      expect(() => {
        SnapIdsCaveatSpecification[SnapCaveatType.SnapIds].validator?.({
          type: SnapCaveatType.SnapIds,
          value: {},
        });
      }).toThrow(
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
      );
    });
  });

  describe('decorator', () => {
    const params: { snapId: SnapId } = { snapId: MOCK_SNAP_ID };
    const context: { origin: OriginString } = { origin: MOCK_ORIGIN };
    it('returns the result of the method implementation', async () => {
      const caveat = {
        type: SnapCaveatType.SnapIds,
        value: { [MOCK_SNAP_ID]: {} },
      };
      const method = jest.fn().mockImplementation(() => 'foo');
      expect(
        await SnapIdsCaveatSpecification[SnapCaveatType.SnapIds].decorator(
          method,
          caveat,
        )({ method: 'hello', params, context }),
      ).toBe('foo');
    });

    it('throws if the origin trying to invoke the snap does not have its permission', async () => {
      const method = jest.fn().mockImplementation(() => 'foo');
      const caveat = { type: SnapCaveatType.SnapIds, value: { foo: {} } };
      await expect(
        SnapIdsCaveatSpecification[SnapCaveatType.SnapIds].decorator(
          method,
          caveat,
        )({ method: 'hello', params, context }),
      ).rejects.toThrow(
        `${MOCK_ORIGIN} does not have permission to invoke ${MOCK_SNAP_ID} snap.`,
      );
    });
  });
});
