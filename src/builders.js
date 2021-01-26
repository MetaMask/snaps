const builders = {
  src: {
    alias: 's',
    describe: 'Source file',
    type: 'string',
    required: true,
    default: 'index.js',
  },

  dist: {
    alias: 'd',
    describe: 'Output directory',
    type: 'string',
    required: true,
    default: 'dist',
  },

  bundle: {
    alias: ['plugin', 'p', 'b'],
    describe: 'Snap bundle file',
    type: 'string',
    required: true,
    default: 'dist/bundle.js',
  },

  root: {
    alias: 'r',
    describe: 'Server root directory',
    type: 'string',
    required: true,
    default: '.',
  },

  port: {
    alias: 'p',
    describe: 'Local server port for testing',
    type: 'number',
    required: true,
    default: 8081,
  },

  sourceMaps: {
    describe: 'Whether builds include sourcemaps',
    type: 'boolean',
    default: false,
  },

  stripComments: {
    alias: 'strip',
    describe: 'Whether to remove code comments from the build output',
    type: 'boolean',
    default: false,
  },

  outfileName: {
    alias: 'n',
    describe: 'Output file name',
    type: 'string',
    default: 'bundle.js',
  },

  manifest: {
    alias: 'm',
    describe: 'Validate project package.json as a Snap manifest',
    type: 'boolean',
    default: true,
  },

  populate: {
    describe: 'Update Snap manifest properties of package.json',
    type: 'boolean',
    default: true,
  },

  eval: {
    alias: 'e',
    describe: 'Attempt to evaluate Snap bundle in SES',
    type: 'boolean',
    default: true,
  },

  verboseErrors: {
    alias: ['v', 'verbose'],
    type: 'boolean',
    describe: 'Display original errors',
    default: false,
  },

  suppressWarnings: {
    alias: ['w'],
    type: 'boolean',
    describe: 'Suppress warnings',
    default: false,
  },

  environment: {
    alias: ['env'],
    describe: 'The execution environment of the plugin.',
    type: 'string',
    default: 'worker',
    choices: ['worker'],
  },
};

module.exports = builders;
