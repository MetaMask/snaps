import { resolve } from 'path';

import { getConfig, loadConfig, resolveConfig, SnapConfig } from './config';

const CONFIG_PATH = resolve(__dirname, '__fixtures__', 'configs');

const DEFAULT_CONFIG: SnapConfig = {
  bundler: 'webpack',
  entry: 'src/index.ts',
  experimental: {
    wasm: false,
  },
  output: {
    clean: false,
    filename: 'bundle.js',
    path: 'dist',
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
          port: 8000,
        },
      },
      {
        cliOptions: {
          src: 'src/index.js',
          port: 8000,
        },
      },
      {
        cliOptions: {
          port: 8000,
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
          src: 'src/index.js',
          port: 8000,
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
      'Invalid snap config (Webpack): At path: entry -- Expected a string, but received: undefined. Make sure that your "snap.config.[j|t]s" file is valid.\nRefer to the documentation for more information: https://docs.metamask.io/snaps/reference/config/',
    );
  });
});

describe('resolveConfig', () => {
  it('resolves a JavaScript config in the provided directory', async () => {
    expect(
      await resolveConfig(resolve(CONFIG_PATH, 'javascript')),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      entry: 'src/index.js',
    });
  });

  it('resolves a TypeScript config in the provided directory', async () => {
    expect(
      await resolveConfig(resolve(CONFIG_PATH, 'typescript')),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      entry: 'src/index.ts',
    });
  });
});
