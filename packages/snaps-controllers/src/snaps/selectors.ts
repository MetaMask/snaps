import type { TruncatedSnap } from '@metamask/snaps-utils';

export const getRunnableSnaps = <Snap extends TruncatedSnap>(snaps: Snap[]) =>
  snaps.filter((snap) => snap.enabled && !snap.blocked);
