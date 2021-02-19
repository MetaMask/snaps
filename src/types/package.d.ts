import { Options } from 'yargs';

export interface SnapsCliGlobals {
  snaps: {
    verboseErrors: boolean;
    suppressWarnings: boolean;
    isWatching: boolean;
  };
}

interface ManifestWalletProperty {
  bundle?: { local?: string; url?: string };
  initialPermissions?: Record<string, unknown>;
}

export interface NodePackageManifest {
  [key: string]: unknown;
  main?: string;
  web3Wallet?: ManifestWalletProperty;
}

export interface Builders {
  readonly src: Readonly<Options>;
  readonly dist: Readonly<Options>;
  readonly bundle: Readonly<Options>;
  readonly root: Readonly<Options>;
  readonly port: Readonly<Options>;
  readonly sourceMaps: Readonly<Options>;
  readonly stripComments: Readonly<Options>;
  readonly outfileName: Readonly<Options>;
  readonly manifest: Readonly<Options>;
  readonly populate: Readonly<Options>;
  readonly eval: Readonly<Options>;
  readonly verboseErrors: Readonly<Options>;
  readonly suppressWarnings: Readonly<Options>;
}
