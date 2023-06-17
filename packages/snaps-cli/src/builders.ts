import type { Options } from 'yargs';

export enum TranspilationModes {
  LocalAndDeps = 'localAndDeps',
  LocalOnly = 'localOnly',
  None = 'none',
}

const builders: Record<string, Readonly<Options>> = {
  bundle: {
    alias: 'b',
    describe: 'Snap bundle file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'dist/bundle.js',
  },

  config: {
    alias: 'c',
    describe: 'Path to config file',
    type: 'string',
    demandOption: false,
    normalize: true,
  },

  dist: {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'dist',
    deprecated: true,
  },

  eval: {
    alias: 'e',
    describe: 'Attempt to evaluate Snap bundle in SES',
    type: 'boolean',
    demandOption: false,
    default: true,
    deprecated: true,
  },

  manifest: {
    alias: 'm',
    describe: 'Validate snap.manifest.json',
    type: 'boolean',
    demandOption: false,
    default: true,
    deprecated: true,
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
        throw new Error(`Invalid port: ${String(arg)}`);
      }
      return port;
    },
    deprecated: true,
  },

  outfileName: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string',
    demandOption: false,
    default: 'bundle.js',
    deprecated: true,
  },

  root: {
    alias: 'r',
    describe: 'Server root directory',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: '.',
    deprecated: true,
  },

  sourceMaps: {
    describe: 'Whether builds include sourcemaps',
    type: 'boolean',
    demandOption: false,
    default: false,
    deprecated: true,
  },

  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'src/index.js',
    deprecated: true,
  },

  stripComments: {
    alias: 'strip',
    describe: 'Whether to remove code comments from the build output',
    type: 'boolean',
    demandOption: false,
    default: true,
    deprecated: true,
  },

  suppressWarnings: {
    type: 'boolean',
    describe: 'Whether to suppress warnings',
    demandOption: false,
    default: false,
    deprecated: true,
  },

  transpilationMode: {
    type: 'string',
    describe:
      'Whether to use Babel to transpile all source code (including dependencies), local source code only, or nothing',
    demandOption: false,
    default: TranspilationModes.LocalOnly,
    choices: Object.values(TranspilationModes),
    deprecated: true,
  },

  depsToTranspile: {
    type: 'array',
    describe: 'Transpile only the listed dependencies.',
    demandOption: false,
    deprecated: true,
  },

  verboseErrors: {
    type: 'boolean',
    describe: 'Display original errors',
    demandOption: false,
    default: true,
    deprecated: true,
  },

  writeManifest: {
    describe: 'Make necessary changes to the snap manifest file',
    type: 'boolean',
    demandOption: false,
    default: true,
    deprecated: true,
  },

  serve: {
    describe: 'Serve snap file(s) locally for testing',
    type: 'boolean',
    demandOption: false,
    default: true,
    deprecated: true,
  },
};

export default builders;
