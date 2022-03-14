import {
  NpmSnapPackageJson,
  SnapManifest,
} from '@metamask/snap-controllers/dist/snaps';

type GetSnapManifestOptions = Partial<Omit<SnapManifest, 'source'>> & {
  shasum?: string;
  filePath?: string;
  packageName?: string;
  registry?: string;
};

// A fake Snap source and its shasum.
export const DEFAULT_SNAP_BUNDLE = 'console.log("Hello, world!");';
export const DEFAULT_SNAP_SHASUM =
  'O4sADgTDj5EP86efVtOEI76NkKZeoKHRzQIlB1j48Lg=';

export const getDefaultRepository = () => {
  return {
    type: 'git' as const,
    url: 'https://github.com/MetaMask/example-snap.git',
  };
};

export const getSnapManifest = ({
  version = '1.0.0',
  description = 'The test example snap!',
  proposedName = '@metamask/example-snap',
  initialPermissions = { snap_confirm: {} },
  shasum = DEFAULT_SNAP_SHASUM,
  filePath = 'dist/bundle.js',
  packageName = '@metamask/example-snap',
  repository = getDefaultRepository(),
}: GetSnapManifestOptions = {}): SnapManifest => {
  return {
    version,
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
        } as const,
      },
    },
    initialPermissions,
    manifestVersion: '0.1' as const,
  };
};

type PartialOrNull<T> = { [P in keyof T]?: T[P] | undefined | null };

export const getPackageJson = ({
  name = '@metamask/example-snap',
  version = '1.0.0',
  description = 'The test example snap!',
  main = 'src/index.js',
  repository = getDefaultRepository(),
}: PartialOrNull<NpmSnapPackageJson> = {}): NpmSnapPackageJson => {
  return Object.entries({
    name,
    version,
    description,
    main,
    repository,
  }).reduce((packageJson, [key, value]) => {
    if (value) {
      packageJson[key] = value;
    }
    return packageJson;
  }, {} as NpmSnapPackageJson);
};

/**
 * Sets all global.snaps values to `false`.
 */
export const resetSnapsGlobal = () => {
  global.snaps = {
    verboseErrors: false,
    suppressWarnings: false,
    isWatching: false,
  };
};

/**
 * A fake Node.js file system error.
 * Basically, {@link Error} but with a `code` property.
 */
export class FakeFsError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }
}
