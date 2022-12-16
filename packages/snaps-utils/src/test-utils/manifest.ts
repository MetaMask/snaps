import { SnapManifest } from '../manifest/validation';
import {
  Chain,
  Namespace,
  RequestNamespace,
  SessionNamespace,
} from '../namespace';
import { NpmSnapPackageJson } from '../types';
import { SemVerVersion } from '../versions';
import { MakeSemVer } from './common';
import { DEFAULT_SNAP_CHECKSUM } from './snap';

type GetSnapManifestOptions = Partial<MakeSemVer<SnapManifest>>;

type GetPackageJsonOptions = Partial<MakeSemVer<NpmSnapPackageJson>>;

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

export const DEFAULT_SOURCE_PATH = 'dist/bundle.js';
export const DEFAULT_ICON_PATH = 'images/icon.svg';

/**
 * Get a mock snap manifest, based on the provided options. This is useful for
 * quickly generating a manifest file, while being able to override any of the
 * values.
 *
 * @param manifest - The optional manifest overrides.
 * @param manifest.version - The version of the snap.
 * @param manifest.description - The description of the snap.
 * @param manifest.name - The proposed name of the snap.
 * @param manifest.permissions - The initial permissions of the snap.
 * @param manifest.checksum - The shasum of the snap.
 * @param manifest.source - The path to the snap.
 * @param manifest.icon - The path to the icon of the snap.
 * @returns The snap manifest.
 */
export const getSnapManifest = ({
  version = '1.0.0' as SemVerVersion,
  description = 'The test example snap!',
  name = '@metamask/example-snap',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  permissions = { snap_confirm: {} },
  checksum = DEFAULT_SNAP_CHECKSUM,
  source = DEFAULT_SOURCE_PATH,
  icon = DEFAULT_ICON_PATH,
}: GetSnapManifestOptions = {}): SnapManifest => {
  return {
    version: version as SemVerVersion,
    description,
    name,
    source,
    icon,
    checksum,
    permissions,
    manifestVersion: 2 as const,
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
