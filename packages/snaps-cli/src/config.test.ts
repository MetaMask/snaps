import { resolve } from 'path';

import {
  getConfig,
  getConfigByArgv,
  loadConfig,
  resolveConfig,
  SnapConfig,
} from './config';

const CONFIG_PATH = resolve(__dirname, '__fixtures__', 'configs');

const DEFAULT_CONFIG: SnapConfig = {
  bundler: 'webpack',
  input: 'src/index.ts',
  evaluate: true,
  experimental: {
    wasm: false,
  },
  manifest: {
    path: resolve(process.cwd(), 'snap.manifest.json'),
    update: true,
  },
  output: {
    clean: false,
    filename: 'bundle.js',
    path: resolve(process.cwd(), 'dist'),
  },
  server: {
    port: 8081,
    root: process.cwd(),
  },
  sourceMap: true,
};

describe('getConfig', () => {
  it('throws an error if `bundler` is not `browserify` or `webpack`', () => {
    expect(() => getConfig({ bundler: 'foo' })).toThrow(
      'Invalid snap config: At path: bundler -- Expected the value to satisfy a union of `"browserify" | "webpack"`, but received: "foo". Make sure that your "snap.config.[j|t]s" file is valid.\nRefer to the documentation for more information: https://docs.metamask.io/snaps/reference/config/',
    );
  });

  it('throws an error if `entry` is being used with `browserify`', () => {
    expect(() =>
      getConfig({
        bundler: 'browserify',
        entry: 'foo',
      }),
    ).toThrow(
      'Invalid snap config (Browserify): At path: entry -- Expected a value of type `never`, but received: `"foo"`. Make sure that your "snap.config.[j|t]s" file is valid.\nRefer to the documentation for more information: https://docs.metamask.io/snaps/reference/config/',
    );
  });

  it('throws an error if `cliOptions` is being used with `webpack`', () => {
    expect(() =>
      getConfig({
        bundler: 'webpack',
        entry: 'foo',
        cliOptions: { port: 8000 },
      }),
    ).toThrow(
      'Invalid snap config (Webpack): At path: cliOptions -- Expected a value of type `never`, but received: `[object Object]`. Make sure that your "snap.config.[j|t]s" file is valid.\nRefer to the documentation for more information: https://docs.metamask.io/snaps/reference/config/',
    );
  });

  describe('browserify', () => {
    it.each([
      {
        bundler: 'browserify',
        cliOptions: {
          src: 'src/index.js',
          port: 8081,
        },
      },
      {
        cliOptions: {
          src: 'src/index.js',
          port: 8081,
        },
      },
      {
        cliOptions: {
          port: 8081,
        },
      },
      {
        cliOptions: {},
      },
      {},
    ])('returns a valid config for `%o`', (value) => {
      const config = getConfig(value);

      expect(config).toStrictEqual({
        bundler: 'browserify',
        cliOptions: {
          bundle: 'dist/bundle.js',
          depsToTranspile: [],
          dist: 'dist',
          eval: true,
          manifest: true,
          outfileName: 'bundle.js',
          port: 8081,
          root: process.cwd(),
          serve: true,
          sourceMaps: false,
          src: 'src/index.js',
          stripComments: true,
          suppressWarnings: false,
          transpilationMode: 'localOnly',
          verboseErrors: true,
          writeManifest: true,
        },
      });
    });
  });
});

describe('loadConfig', () => {
  it('loads an ESM-based config', async () => {
    expect(await loadConfig(resolve(CONFIG_PATH, 'esm.ts'))).toStrictEqual(
      DEFAULT_CONFIG,
    );
  });

  it('loads a CJS-based config', async () => {
    expect(await loadConfig(resolve(CONFIG_PATH, 'cjs.ts'))).toStrictEqual(
      DEFAULT_CONFIG,
    );
  });

  it('throws an error if the config is invalid', async () => {
    await expect(
      loadConfig(resolve(CONFIG_PATH, 'invalid.ts')),
    ).rejects.toThrow(
      'Invalid snap config (Webpack): At path: input -- Expected a string, but received: undefined. Make sure that your "snap.config.[j|t]s" file is valid.\nRefer to the documentation for more information: https://docs.metamask.io/snaps/reference/config/',
    );
  });

  it('throws an error if the config is not JavaScript or TypeScript', async () => {
    await expect(
      loadConfig(resolve(CONFIG_PATH, 'invalid.json')),
    ).rejects.toThrow(
      `Unable to load snap config file at "${resolve(
        CONFIG_PATH,
        'invalid.json',
      )}".`,
    );
  });
});

describe('resolveConfig', () => {
  it('resolves a JavaScript config in the provided directory', async () => {
    expect(
      await resolveConfig(resolve(CONFIG_PATH, 'javascript')),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      input: 'src/index.js',
    });
  });

  it('resolves a TypeScript config in the provided directory', async () => {
    expect(
      await resolveConfig(resolve(CONFIG_PATH, 'typescript')),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      input: 'src/index.ts',
    });
  });
});

describe('getConfigByArgv', () => {
  it('returns a valid config for `--config`', async () => {
    expect(
      // @ts-expect-error - Partial `argv`.
      await getConfigByArgv({
        config: resolve(CONFIG_PATH, 'typescript/snap.config.ts'),
      }),
    ).toStrictEqual(DEFAULT_CONFIG);
  });

  it('returns a valid config without `--config`', async () => {
    expect(
      // @ts-expect-error - Partial `argv`.
      await getConfigByArgv({}, resolve(CONFIG_PATH, 'typescript/')),
    ).toStrictEqual(DEFAULT_CONFIG);
  });

  it('throws if `--config` is not a file', async () => {
    await expect(
      // @ts-expect-error - Partial `argv`.
      getConfigByArgv({
        config: resolve(CONFIG_PATH, 'typescript/'),
      }),
    ).rejects.toThrow(
      `Could not find a config file at "${resolve(
        CONFIG_PATH,
        'typescript/',
      )}". Make sure that the path is correct.`,
    );
  });
});
