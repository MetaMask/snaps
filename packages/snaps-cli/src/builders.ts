import { Options } from 'yargs';

export type SnapsCliBuilders = {
  readonly src: Readonly<Options>;
  readonly dist: Readonly<Options>;
  readonly bundle: Readonly<Options>;
  readonly root: Readonly<Options>;
  readonly port: Readonly<Options>;
  readonly sourceMaps: Readonly<Options>;
  readonly stripComments: Readonly<Options>;
  readonly outfileName: Readonly<Options>;
  readonly manifest: Readonly<Options>;
  readonly writeManifest: Readonly<Options>;
  readonly eval: Readonly<Options>;
  readonly verboseErrors: Readonly<Options>;
  readonly suppressWarnings: Readonly<Options>;
};

const builders: SnapsCliBuilders = {
  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'src/index.js',
  },

  dist: {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'dist',
  },

  bundle: {
    alias: 'b',
    describe: 'Snap bundle file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'dist/bundle.js',
  },

  root: {
    alias: 'r',
    describe: 'Server root directory',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: '.',
  },

  port: {
    alias: 'p',
    describe: 'Local server port for testing',
    type: 'number',
    demandOption: true,
    default: 8081,
    coerce: (arg: unknown) => {
      const port = Number.parseInt(String(arg), 10);
      if (Number.isNaN(port)) {
        throw new Error(`Invalid port: ${arg}`);
      }
      return port;
    },
  },

  sourceMaps: {
    describe: 'Whether builds include sourcemaps',
    type: 'boolean',
    demandOption: false,
    default: false,
  },

  stripComments: {
    alias: 'strip',
    describe: 'Whether to remove code comments from the build output',
    type: 'boolean',
    demandOption: false,
    default: false,
  },

  outfileName: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string',
    demandOption: false,
    default: 'bundle.js',
  },

  manifest: {
    alias: 'm',
    describe: 'Validate snap.manifest.json',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  writeManifest: {
    describe: 'Make necessary changes to the Snap manifest file',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  eval: {
    alias: 'e',
    describe: 'Attempt to evaluate Snap bundle in SES',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  verboseErrors: {
    type: 'boolean',
    describe: 'Display original errors',
    demandOption: false,
    default: false,
  },

  suppressWarnings: {
    type: 'boolean',
    describe: 'Suppress warnings',
    demandOption: false,
    default: false,
  },
};

export default builders;
