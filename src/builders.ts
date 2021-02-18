import { Builders } from './types/package';

const builders: Builders = {
  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    demandOption: true,
    normalize: true,
    default: 'index.js',
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
    describe: 'Validate project package.json as a Snap manifest',
    type: 'boolean',
    demandOption: false,
    default: true,
  },

  populate: {
    describe: 'Update Snap manifest properties of package.json',
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
    alias: 'v',
    type: 'boolean',
    describe: 'Display original errors',
    demandOption: false,
    default: false,
  },

  suppressWarnings: {
    alias: 'sw',
    type: 'boolean',
    describe: 'Suppress warnings',
    demandOption: false,
    default: false,
  },

  environment: {
    alias: 'env',
    describe: 'The execution environment of the plugin.',
    type: 'string',
    demandOption: false,
    default: 'worker',
    choices: ['worker'],
  },
};

export default builders;
