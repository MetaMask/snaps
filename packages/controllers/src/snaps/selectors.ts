import { TruncatedSnap } from '@metamask/snap-utils';

export const getRunnableSnaps = (snaps: TruncatedSnap[]) =>
  snaps.filter((snap) => snap.enabled && !snap.blocked);
