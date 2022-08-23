import { isCaipChainId, validateSnapId } from './snaps';
import { SnapIdPrefixes } from './types';

describe('validateSnapId', () => {
  it.each([undefined, {}, null, true, 2])('throws for non-strings', (value) => {
    expect(() => validateSnapId(value)).toThrow(
      'Invalid snap id. Not a string.',
    );
  });

  it('throws for invalid snap id', () => {
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

describe('isCaipChainId', () => {
  it.each([undefined, {}, null, true, 2])(
    'returns false for non-strings',
    (value) => {
      expect(isCaipChainId(value)).toBe(false);
    },
  );

  it.each([
    'eip155:1',
    'cosmos:iov-mainnet',
    'bip122:000000000019d6689c085ae165831e93',
    'cosmos:cosmoshub-2',
  ])('returns true for valid IDs', (value) => {
    expect(isCaipChainId(value)).toBe(true);
  });
});
