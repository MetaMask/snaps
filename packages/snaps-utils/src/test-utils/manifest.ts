import { SemVerVersion } from '@metamask/utils';

import { SnapManifest } from '../manifest/validation';
import {
  Chain,
  Namespace,
  RequestNamespace,
  SessionNamespace,
} from '../namespace';
import { getSnapChecksum } from '../snaps';
import { NpmSnapPackageJson, SnapFiles } from '../types';
import { VirtualFile } from '../virtual-file';
import { MakeSemVer } from './common';

type GetSnapManifestOptions = Partial<MakeSemVer<SnapManifest>> & {
  shasum?: string;
  filePath?: string;
  packageName?: string;
  registry?: string;
  iconPath?: string;
};

type GetPackageJsonOptions = Partial<MakeSemVer<NpmSnapPackageJson>>;

export const DEFAULT_SOURCE_PATH = 'dist/bundle.js';
export const DEFAULT_ICON_PATH = 'images/icon.svg';
export const DEFAULT_MANIFEST_PATH = 'snap.manifest.json';
export const DEFAULT_PACKAGE_JSON_PATH = 'package.json';

export const MOCK_SNAP_NAME = '@metamask/example-snap';
export const MOCK_SNAP_DESCRIPTION = 'The test example snap!';
export const MOCK_SNAP_VERSION = '1.0.0' as SemVerVersion;
/* eslint-disable @typescript-eslint/naming-convention */
export const MOCK_INITIAL_PERMISSIONS = {
  snap_confirm: {},
  'endowment:rpc': { snaps: true, dapps: false },
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Get the default package repository, in a format compatible with
 * `package.json`.
 *
 * @returns The default package repository.
 */
export const getDefaultRepository = () => {
  return {
    type: 'git' as const,
    url: 'https://github.com/MetaMask/example-snap.git',
  };
};

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

export const DEFAULT_SNAP_ICON = '<svg />';

// Defined separately to prevent circular dependencies, should match getSnapManifest()
const SHASUM_MANIFEST = {
  version: MOCK_SNAP_VERSION,
  description: MOCK_SNAP_DESCRIPTION,
  proposedName: MOCK_SNAP_NAME,
  repository: getDefaultRepository(),
  source: {
    shasum: '',
    location: {
      npm: {
        filePath: DEFAULT_SOURCE_PATH,
        packageName: MOCK_SNAP_NAME,
        registry: 'https://registry.npmjs.org',
        iconPath: DEFAULT_ICON_PATH,
      } as const,
    },
  },
  initialPermissions: MOCK_INITIAL_PERMISSIONS,
  manifestVersion: '0.1' as const,
};

export const DEFAULT_SNAP_SHASUM = getSnapChecksum({
  sourceCode: new VirtualFile({
    value: DEFAULT_SNAP_BUNDLE,
    path: DEFAULT_SOURCE_PATH,
  }),
  svgIcon: new VirtualFile({
    value: DEFAULT_SNAP_ICON,
    path: DEFAULT_ICON_PATH,
  }),
  manifest: new VirtualFile({
    value: JSON.stringify(SHASUM_MANIFEST),
    result: SHASUM_MANIFEST,
    path: DEFAULT_MANIFEST_PATH,
  }),
});

/**
 * Get a mock snap manifest, based on the provided options. This is useful for
 * quickly generating a manifest file, while being able to override any of the
 * values.
 *
 * @param manifest - The optional manifest overrides.
 * @param manifest.version - The version of the snap.
 * @param manifest.description - The description of the snap.
 * @param manifest.proposedName - The proposed name of the snap.
 * @param manifest.initialPermissions - The initial permissions of the snap.
 * @param manifest.shasum - The shasum of the snap.
 * @param manifest.filePath - The path to the snap.
 * @param manifest.packageName - The name of the snap.
 * @param manifest.repository - The repository of the snap.
 * @param manifest.iconPath - The path to the icon of the snap.
 * @returns The snap manifest.
 */
export const getSnapManifest = ({
  version = MOCK_SNAP_VERSION,
  description = MOCK_SNAP_DESCRIPTION,
  proposedName = MOCK_SNAP_NAME,
  initialPermissions = MOCK_INITIAL_PERMISSIONS,
  shasum = DEFAULT_SNAP_SHASUM,
  filePath = DEFAULT_SOURCE_PATH,
  packageName = MOCK_SNAP_NAME,
  repository = getDefaultRepository(),
  iconPath = DEFAULT_ICON_PATH,
}: GetSnapManifestOptions = {}): SnapManifest => {
  return {
    version: version as SemVerVersion,
    description,
    proposedName,
    repository,
    source: {
      shasum,
      location: {
        npm: {
          filePath,
          packageName,
          registry: 'https://registry.npmjs.org',
          iconPath,
        } as const,
      },
    },
    initialPermissions,
    manifestVersion: '0.1' as const,
  };
};

/**
 * Get a mock `package.json`, based on the provided options. This is useful for
 * quickly generating a `package.json` file, while being able to override any of
 * the values.
 *
 * @param package - The optional `package.json` overrides.
 * @param package.name - The name of the package.
 * @param package.version - The version of the package.
 * @param package.description - The description of the package.
 * @param package.main - The entry point of the package.
 * @param package.repository - The repository of the package.
 * @returns The `package.json` object.
 */
export const getPackageJson = ({
  name = '@metamask/example-snap',
  version = '1.0.0' as SemVerVersion,
  description = 'The test example snap!',
  main = 'src/index.js',
  repository = getDefaultRepository(),
}: GetPackageJsonOptions = {}): NpmSnapPackageJson => {
  return {
    name,
    version: version as SemVerVersion,
    description,
    main,
    repository,
  };
};

export const getSnapFiles = ({
  manifest = SHASUM_MANIFEST,
  packageJson = getPackageJson(),
  sourceCode = DEFAULT_SNAP_BUNDLE,
  svgIcon = DEFAULT_SNAP_ICON,
  updateChecksum = true,
}: {
  manifest?: SnapManifest | VirtualFile<SnapManifest>;
  sourceCode?: string | VirtualFile;
  packageJson?: NpmSnapPackageJson;
  svgIcon?: string | VirtualFile;
  updateChecksum?: boolean;
} = {}): SnapFiles => {
  const files = {
    manifest:
      manifest instanceof VirtualFile
        ? manifest
        : new VirtualFile({
            value: JSON.stringify(manifest),
            result: manifest,
            path: DEFAULT_MANIFEST_PATH,
          }),
    packageJson: new VirtualFile({
      value: JSON.stringify(packageJson),
      result: packageJson,
      path: DEFAULT_PACKAGE_JSON_PATH,
    }),
    sourceCode:
      sourceCode instanceof VirtualFile
        ? sourceCode
        : new VirtualFile({
            value: sourceCode,
            path: DEFAULT_SOURCE_PATH,
          }),
    // eslint-disable-next-line no-nested-ternary
    svgIcon: svgIcon
      ? svgIcon instanceof VirtualFile
        ? svgIcon
        : new VirtualFile({
            value: svgIcon,
            path: DEFAULT_ICON_PATH,
          })
      : undefined,
  };
  if (updateChecksum) {
    files.manifest.result.source.shasum = getSnapChecksum(files);
    files.manifest.value = JSON.stringify(files.manifest.result);
  }
  return files;
};

export const getChain = ({
  id = 'eip155:1',
  name = 'Ethereum Mainnet',
}: Partial<Chain> = {}): Chain => ({
  id,
  name,
});

export const getNamespace = ({
  chains = [getChain()],
  methods = ['eth_signTransaction', 'eth_accounts'],
  events = ['accountsChanged'],
}: Partial<Namespace> = {}): Namespace => ({
  chains,
  methods,
  events,
});

export const getRequestNamespace = ({
  chains = ['eip155:1'],
  methods = ['eth_signTransaction', 'eth_accounts'],
  events = ['accountsChanged'],
}: Partial<RequestNamespace> = {}): RequestNamespace => ({
  chains,
  methods,
  events,
});

export const getSessionNamespace = ({
  chains = ['eip155:1'],
  methods = ['eth_signTransaction', 'eth_accounts'],
  events = ['accountsChanged'],
  accounts = ['eip155:1:0x0000000000000000000000000000000000000000'],
}: Partial<SessionNamespace> = {}): SessionNamespace => ({
  chains,
  methods,
  events,
  accounts,
});
