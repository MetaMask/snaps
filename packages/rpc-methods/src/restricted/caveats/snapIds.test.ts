import { Caveat, OriginString } from '@metamask/permission-controller';
import { SnapCaveatType, SnapId } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID, MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';
import { Json } from '@metamask/utils';

import { validateSnapIdsCaveat, SnapIdsCaveatSpecification } from './snapIds';

describe('validateSnapIdsCaveats', () => {
  it('validates that a caveat has a non-empty object as a caveat value', () => {
    const caveat = {
      type: SnapCaveatType.SnapIds,
      value: { [MOCK_SNAP_ID]: {} },
    };
    const missingValueCaveat = {
      type: SnapCaveatType.SnapIds,
    };
    const emptyValueCaveat = {
      type: SnapCaveatType.SnapIds,
      value: {},
    };
    expect(() => validateSnapIdsCaveat(caveat)).not.toThrow();
    expect(() =>
      validateSnapIdsCaveat(missingValueCaveat as Caveat<string, Json>),
    ).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.',
    );
    expect(() => validateSnapIdsCaveat(emptyValueCaveat)).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.',
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
