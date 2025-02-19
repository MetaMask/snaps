import type { SemVerVersion, Opaque } from '@metamask/utils';

import type { InitialPermissions } from './permissions';

export type SnapId = Opaque<string, typeof snapIdSymbol>;

// TODO: Either fix this lint violation or explain why it's necessary to
//  ignore.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const snapIdSymbol: unique symbol;

export type Snap = {
  id: SnapId;
  initialPermissions: InitialPermissions;
  version: SemVerVersion;
  enabled: boolean;
  blocked: boolean;
};
