import { satisfies as satisfiesSemver } from 'semver';
import { SnapId } from '@metamask/snap-types';
import { getSnapPrefix, SnapIdPrefixes } from './utils';

type VerifiedSnap = {
  id: SnapId;
  version: string;
};

const VERIFIED_SNAPS: readonly VerifiedSnap[] = Object.freeze([
  { id: 'npm:@metamask/test-snap-confirm', version: '<=0.3.0' },
  { id: 'npm:@metamask/test-snap-error', version: '<=0.3.0' },
  { id: 'npm:@metamask/test-snap-bip44', version: '<=0.3.0' },
  { id: 'npm:@metamask/test-snap-managestate', version: '<=0.3.0' },
]);

export function isSnapVerified(snapId: SnapId, version: string) {
  const snapPrefix = getSnapPrefix(snapId);
  if (snapPrefix === SnapIdPrefixes.local) {
    return false;
  }
  const verifiedSnap = VERIFIED_SNAPS.find((s) => s.id === snapId);
  return (
    verifiedSnap !== undefined && satisfiesSemver(version, verifiedSnap.version)
  );
}
