import { getSnapSourceShasum, SnapManifest } from '@metamask/snap-utils';
import { Json } from '@metamask/utils';
import {
  isBlocked,
  isInstalling,
  isRunning,
  isStarting,
  isStopping,
  Snap,
  Status,
  statusConfig,
} from './Snap';

const statusStates = Object.keys(statusConfig.states) as Status[];

const MOCK_SNAP_ID = 'npm:example-snap';
const MOCK_SNAP_SOURCE_CODE = `
exports.onRpcRequest = async ({ origin, request }) => {
  const {method, params, id} = request;
  return method + id;
};
`;
const MOCK_SNAP_SHASUM = getSnapSourceShasum(MOCK_SNAP_SOURCE_CODE);
const MOCK_ORIGIN = 'foo.com';

// TODO(ritave): Extract from SnapController.test.ts
const getSnapObject = ({
  id = MOCK_SNAP_ID,
  initialPermissions = {},
  manifest = getSnapManifest(),
  permissionName = `wallet_snap_${MOCK_SNAP_ID}`,
  sourceCode = MOCK_SNAP_SOURCE_CODE,
  status = 'stopped' as Status,
  version = '1.0.0',
  versionHistory = [
    { origin: MOCK_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
} = {}): Snap => {
  return {
    initialPermissions,
    id,
    permissionName,
    version,
    manifest,
    status,
    sourceCode,
    versionHistory,
  } as const;
};

const getSnapManifest = ({
  version = '1.0.0',
  proposedName = 'ExampleSnap',
  description = 'arbitraryDescription',
  filePath = 'dist/bundle.js',
  iconPath = 'images/icon.svg',
  packageName = 'example-snap',
  initialPermissions = {},
  shasum = MOCK_SNAP_SHASUM,
}: Pick<Partial<SnapManifest>, 'version' | 'proposedName' | 'description'> & {
  filePath?: string;
  iconPath?: string;
  initialPermissions?: Record<string, Record<string, Json>>;
  packageName?: string;
  shasum?: string;
} = {}) => {
  return {
    version,
    proposedName,
    description,
    repository: {
      type: 'git',
      url: 'https://github.com/example-snap',
    },
    source: {
      shasum,
      location: {
        npm: {
          filePath,
          iconPath,
          packageName,
          registry: 'https://registry.npmjs.org',
        },
      },
    },
    initialPermissions,
    manifestVersion: '0.1',
  } as const;
};

describe('Snap guards', () => {
  function diff<T>(a: readonly T[], b: readonly T[]): T[] {
    return a.filter((el) => !b.includes(el));
  }

  // Yo dawg I herd you like tests so we put tests in yo tests so you can test while you test
  describe.each([
    [isRunning, ['running', 'starting'] as const],
    [isInstalling, ['installing', 'installing:authorize', 'updating'] as const],
    [isBlocked, ['blocked'] as const],
    [isStarting, ['starting'] as const],
    [isStopping, ['stopping'] as const],
  ])(
    '%p',
    (testedGuard: (snap: Snap) => boolean, activeStates: readonly Status[]) => {
      it.each(activeStates)('returns true in %s state', (status) => {
        const snap = getSnapObject({ status });
        expect(testedGuard(snap)).toStrictEqual(true);
      });

      it.each(diff(statusStates, activeStates))(
        'returns false in %s state',
        (status) => {
          const snap = getSnapObject({ status });
          expect(testedGuard(snap)).toStrictEqual(false);
        },
      );
    },
  );
});
