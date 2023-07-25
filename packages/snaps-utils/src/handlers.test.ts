import { SNAP_EXPORTS } from './handlers';

describe('SNAP_EXPORTS', () => {
  describe('validator', () => {
    it.each(Object.values(SNAP_EXPORTS))(
      'validates that the snap export is a function',
      ({ validator }) => {
        expect(validator(() => undefined)).toBe(true);
        expect(validator('')).toBe(false);
      },
    );
  });
});
