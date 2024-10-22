import { isValidSemVerVersion } from '@metamask/utils';

import { getPlatformVersion } from './platform-version';

describe('getPlatformVersion', () => {
  it('returns the version of the SDK', () => {
    const version = getPlatformVersion();
    expect(isValidSemVerVersion(version)).toBe(true);
  });
});
