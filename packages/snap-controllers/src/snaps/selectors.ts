import { TruncatedSnap } from '@metamask/snap-utils';

export const getRunnableSnaps = <T extends TruncatedSnap>(snaps: T[]) =>
  snaps.filter((snap) => snap.enabled && !snap.blocked);
