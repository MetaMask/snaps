import type { Options } from 'yargs';

const builders = {
  analyze: {
    describe: 'Analyze the Snap bundle',
    type: 'boolean',
  },

  build: {
    describe: 'Build the Snap bundle',
    type: 'boolean',
    default: true,
  },

  config: {
    alias: 'c',
    describe: 'Path to config file',
    type: 'string',
    normalize: true,
  },

  eval: {
    describe: 'Evaluate the Snap bundle',
    type: 'boolean',
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

  manifest: {
    alias: 'm',
    describe: 'Path to snap.manifest.json file',
    type: 'string',
    normalize: true,
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
  },

  preinstalled: {
    describe: 'Build the Snap as a preinstalled Snap',
    type: 'boolean',
    default: false,
  },
} as const satisfies Record<string, Readonly<Options>>;

export default builders;
