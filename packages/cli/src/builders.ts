import { Options } from 'yargs';

export type SnapsCliBuilders = {
  readonly bundle: Readonly<Options>;
  readonly dist: Readonly<Options>;
  readonly eval: Readonly<Options>;
  readonly manifest: Readonly<Options>;
  readonly outfileName: Readonly<Options>;
  readonly port: Readonly<Options>;
  readonly root: Readonly<Options>;
  readonly sourceMaps: Readonly<Options>;
  readonly src: Readonly<Options>;
  readonly stripComments: Readonly<Options>;
  readonly suppressWarnings: Readonly<Options>;
  readonly transpilationMode: Readonly<Options>;
  readonly depsToTranspile: Readonly<Options>;
  readonly verboseErrors: Readonly<Options>;
  readonly writeManifest: Readonly<Options>;
  readonly serve: Readonly<Options>;
  readonly template: Readonly<Options>;
};

export enum TranspilationModes {
  localAndDeps = 'localAndDeps',
  localOnly = 'localOnly',
  none = 'none',
}

export enum TemplateType {
  TypeScript = 'typescript',
  JavaScript = 'javascript',
}

const builders: SnapsCliBuilders = {
  bundle: {
    alias: 'b',
    describe: 'Snap bundle file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'dist/bundle.js',
  },

  dist: {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'dist',
  },

  eval: {
    alias: 'e',
    describe: 'Attempt to evaluate Snap bundle in SES',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  manifest: {
    alias: 'm',
    describe: 'Validate snap.manifest.json',
    type: 'boolean',
    demandOption: false,
    default: true,
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

  outfileName: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string',
    demandOption: false,
    default: 'bundle.js',
  },

  root: {
    alias: 'r',
    describe: 'Server root directory',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: '.',
  },

  sourceMaps: {
    describe: 'Whether builds include sourcemaps',
    type: 'boolean',
    demandOption: false,
    default: false,
  },

  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'src/index.js',
  },

  stripComments: {
    alias: 'strip',
    describe: 'Whether to remove code comments from the build output',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  suppressWarnings: {
    type: 'boolean',
    describe: 'Whether to suppress warnings',
    demandOption: false,
    default: false,
  },

  transpilationMode: {
    type: 'string',
    describe:
      'Whether to use Babel to transpile all source code (including dependencies), local source code only, or nothing.',
    demandOption: false,
    default: TranspilationModes.localOnly,
    choices: Object.values(TranspilationModes),
  },

  depsToTranspile: {
    type: 'array',
    describe: 'Transpile only the listed dependencies.',
    demandOption: false,
  },

  verboseErrors: {
    type: 'boolean',
    describe: 'Display original errors',
    demandOption: false,
    default: true,
  },

  writeManifest: {
    describe: 'Make necessary changes to the Snap manifest file',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  serve: {
    describe: 'Serve Snap file(s) locally for testing',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  template: {
    alias: 't',
    describe: 'Specify which template to use (TypeScript or JavaScript)',
    type: 'string',
    demandOption: false,
    default: TemplateType.TypeScript,
    choices: Object.values(TemplateType),
  },
};

export default builders;
