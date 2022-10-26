import {
  getSnapSourceShasum,
  PersistedSnap,
  Snap,
  SnapStatus,
  TruncatedSnap,
} from '../snaps';
import { getSnapManifest } from './manifest';

/**
 * A mock snap source and its shasum.
 */
export const DEFAULT_SNAP_BUNDLE = `
  module.exports.onRpcRequest = ({ request }) => {
    console.log("Hello, world!");

    const { method, id } = request;
    return method + id;
  };
`;

export const DEFAULT_SNAP_SHASUM = getSnapSourceShasum(DEFAULT_SNAP_BUNDLE);

export const DEFAULT_SNAP_ICON = '<svg />';

export const MOCK_SNAP_ID = 'npm:@metamask/example-snap';
export const MOCK_LOCAL_SNAP_ID = 'local:@metamask/example-snap';
export const MOCK_ORIGIN = 'example.com';

export const getPersistedSnapObject = ({
  blocked = false,
  enabled = true,
  id = MOCK_SNAP_ID,
  initialPermissions = getSnapManifest().initialPermissions,
  manifest = getSnapManifest(),
  permissionName = `wallet_snap_${id}`,
  sourceCode = DEFAULT_SNAP_BUNDLE,
  status = SnapStatus.Stopped,
  version = getSnapManifest().version,
  versionHistory = [
    { origin: MOCK_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
}: Partial<PersistedSnap> = {}): PersistedSnap => {
  return {
    blocked,
    initialPermissions,
    id,
    permissionName,
    version,
    manifest,
    status,
    enabled,
    sourceCode,
    versionHistory,
  } as const;
};

export const getSnapObject = ({
  blocked = false,
  enabled = true,
  id = MOCK_SNAP_ID,
  initialPermissions = getSnapManifest().initialPermissions,
  manifest = getSnapManifest(),
  permissionName = `wallet_snap_${id}`,
  status = SnapStatus.Stopped,
  version = getSnapManifest().version,
  versionHistory = [
    { origin: MOCK_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
}: Partial<Snap> = {}): Snap => {
  return {
    blocked,
    initialPermissions,
    id,
    permissionName,
    version,
    manifest,
    status,
    enabled,
    versionHistory,
  } as const;
};

export const getTruncatedSnap = ({
  initialPermissions = getSnapManifest().initialPermissions,
  id = MOCK_SNAP_ID,
  permissionName = `wallet_snap_${id}`,
  version = getSnapManifest().version,
  enabled = true,
  blocked = false,
}: Partial<TruncatedSnap> = {}): TruncatedSnap => {
  return {
    initialPermissions,
    id,
    permissionName,
    version,
    enabled,
    blocked,
  } as const;
};

/**
 * Gets a whole suite of associated snap data, including the snap's id, origin,
 * package name, source code, shasum, manifest, and SnapController state object.
 *
 * @param options - Options bag.
 * @param options.id - The id of the snap.
 * @param options.origin - The origin associated with the snap's installation
 * request.
 * @param options.sourceCode - The snap's source code. Will be used to compute
 * the snap's shasum.
 * @param options.blocked - Whether the snap's state object should indicate that
 * the snap is blocked.
 * @param options.enabled - Whether the snap's state object should indicate that
 * the snap is enabled. Must not be `true` if the snap is blocked.
 * @returns The mock snap data.
 */
export const getMockSnapData = ({
  blocked = false,
  enabled = true,
  id,
  origin,
  sourceCode,
}: {
  id: string;
  origin: string;
  sourceCode?: string;
  blocked?: boolean;
  enabled?: boolean;
}) => {
  if (blocked && enabled) {
    throw new Error('A snap may not be enabled if it is blocked.');
  }

  const packageName = `${id}-package`;
  const manifest = getSnapManifest();

  return {
    id,
    origin,
    packageName,
    shasum: DEFAULT_SNAP_SHASUM,
    sourceCode,
    manifest,
    stateObject: getPersistedSnapObject({
      blocked,
      enabled,
      id,
      manifest,
      sourceCode,
    }),
  };
};
