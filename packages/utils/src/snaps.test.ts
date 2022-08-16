import { validateSnapId } from './snaps';
import { SnapIdPrefixes } from './types';

describe('validateSnapId', () => {
  it('throws if not string', () => {
    const MSG = 'Invalid snap id. Not a string.';
    expect(() => validateSnapId(undefined)).toThrow(MSG);
    expect(() => validateSnapId({})).toThrow(MSG);
    expect(() => validateSnapId(null)).toThrow(MSG);
    expect(() =>
      validateSnapId(() => {
        /* do nothing */
      }),
    ).toThrow(MSG);
  });

  it('throws if not valid snap id', () => {
    expect(() => validateSnapId('foo:bar')).toThrow(
      'Invalid snap id. Unknown prefix.',
    );
  });

  it.each(Object.values(SnapIdPrefixes))(
    'returns with "%s" prefix',
    (prefix) => {
      expect(() => validateSnapId(`${prefix}bar`)).not.toThrow();
    },
  );
});
