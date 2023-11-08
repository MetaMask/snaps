import type { SemVerVersion, Opaque } from '@metamask/utils';

import type { InitialPermissions } from './permissions';

export type SnapId = Opaque<string, typeof snapIdSymbol>;
declare const snapIdSymbol: unique symbol;

export type Snap = {
  id: SnapId;
  initialPermissions: InitialPermissions;
  version: SemVerVersion;
  enabled: boolean;
  blocked: boolean;
};
