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

export interface Builder {
  [key: string]: Options;
  src: Options;
  dist: Options;
  bundle: Options;
  root: Options;
  port: Options;
  sourceMaps: Options;
  stripComments: Options;
  outfileName: Options;
  manifest: Options;
  populate: Options;
  eval: Options;
  verboseErrors: Options;
  suppressWarnings: Options;
  environment: Options;
}
