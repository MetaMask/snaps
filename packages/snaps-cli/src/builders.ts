import type { Options } from 'yargs';

export enum TranspilationModes {
  LocalAndDeps = 'localAndDeps',
  LocalOnly = 'localOnly',
  None = 'none',
}

const builders: Record<string, Readonly<Options>> = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  config: {
    alias: 'c',
    describe: 'Path to config file',
    type: 'string',
    normalize: true,
  },

  fix: {
    describe: 'Attempt to fix snap.manifest.json',
    type: 'boolean',
  },

  input: {
    alias: 'i',
    describe: 'Snap bundle file to evaluate',
    type: 'string',
    normalize: true,
  },

  // Deprecated Browserify options.
  bundle: {
    alias: 'b',
    describe: 'Snap bundle file',
    type: 'string',
    normalize: true,
    deprecated: 'Use --input instead.',
  },

  dist: {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    normalize: true,
    deprecated: true,
  },

  eval: {
    alias: 'e',
    describe: 'Attempt to evaluate Snap bundle in SES',
    type: 'boolean',
    deprecated: true,
  },

  manifest: {
    alias: 'm',
    describe: 'Validate snap.manifest.json',
    type: 'boolean',
    deprecated: true,
  },

  port: {
    alias: 'p',
    describe: 'Local server port for testing',
    type: 'number',
    coerce: (arg: unknown) => {
      const port = Number.parseInt(String(arg), 10);
      if (Number.isNaN(port)) {
        throw new Error(`Invalid port: "${String(arg)}".`);
      }

      return port;
    },
    deprecated: true,
  },

  outfileName: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string',
    deprecated: true,
  },

  root: {
    alias: 'r',
    describe: 'Server root directory',
    type: 'string',
    normalize: true,
    deprecated: true,
  },

  sourceMaps: {
    describe: 'Whether builds include sourcemaps',
    type: 'boolean',
    deprecated: true,
  },

  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    normalize: true,
    deprecated: true,
  },

  stripComments: {
    alias: 'strip',
    describe: 'Whether to remove code comments from the build output',
    type: 'boolean',
    deprecated: true,
  },

  suppressWarnings: {
    type: 'boolean',
    describe: 'Whether to suppress warnings',
    deprecated: true,
  },

  transpilationMode: {
    type: 'string',
    describe:
      'Whether to use Babel to transpile all source code (including dependencies), local source code only, or nothing',
    choices: Object.values(TranspilationModes),
    deprecated: true,
  },

  depsToTranspile: {
    type: 'array',
    describe: 'Transpile only the listed dependencies.',
    deprecated: true,
  },

  verboseErrors: {
    type: 'boolean',
    describe: 'Display original errors',
    deprecated: true,
  },

  writeManifest: {
    describe: 'Make necessary changes to the snap manifest file',
    type: 'boolean',
    deprecated: true,
  },

  serve: {
    describe: 'Serve snap file(s) locally for testing',
    type: 'boolean',
    deprecated: true,
  },
};

export default builders;
