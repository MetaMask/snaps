import { isSnapVerified } from './verified-snaps';

describe('isSnapVerified', () => {
  it('returns false for local snaps', () => {
    expect(isSnapVerified('local:http://localhost:8080', '1.0.0')).toBe(false);
  });

  it('returns false for non-satisfying snap versions', () => {
    const snapId = 'npm:@metamask/test-snap-confirm';
    expect(isSnapVerified(snapId, '0.3.1')).toBe(false);
    expect(isSnapVerified(snapId, '0.4.0')).toBe(false);
  });

  it('returns true for satisfying snap versions', () => {
    const snapId = 'npm:@metamask/test-snap-bip44';
    expect(isSnapVerified(snapId, '0.3.0')).toBe(true);
    expect(isSnapVerified(snapId, '0.2.0')).toBe(true);
  });
});
