import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { resolve } from 'path';

import {
  getConfig,
  getConfigByArgv,
  loadConfig,
  mergeLegacyOptions,
  resolveConfig,
} from './config';

const CONFIG_PATH = resolve(__dirname, '__fixtures__', 'configs');

const DEFAULT_CONFIG = getMockConfig('webpack');

describe('getConfig', () => {
  it('throws an error if `bundler` is not `browserify` or `webpack`', () => {
    expect(() => getConfig({ bundler: 'foo' })).toThrow(
      'Invalid snap config file: At path: bundler -- Expected the value to satisfy a union of `"browserify" | "webpack"`, but received: "foo".',
    );
  });

  it('throws an error if `entry` is being used with `browserify`', () => {
    expect(() =>
      getConfig({
        bundler: 'browserify',
        entry: 'foo',
      }),
    ).toThrow(
      'Invalid snap config file: At path: entry -- Expected a value of type `never`, but received: `"foo"`.',
    );
  });

  it('throws an error if `cliOptions` is being used with `webpack`', () => {
    expect(() =>
      getConfig({
        bundler: 'webpack',
        input: 'foo',
        cliOptions: { port: 8000 },
      }),
    ).toThrow(
      'Invalid snap config file: At path: cliOptions -- Expected a value of type `never`, but received: `[object Object]`.',
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
          bundle: resolve(process.cwd(), 'dist', 'bundle.js'),
          depsToTranspile: [],
          dist: resolve(process.cwd(), 'dist'),
          eval: true,
          manifest: true,
          outfileName: 'bundle.js',
          port: 8081,
          root: process.cwd(),
          serve: true,
          sourceMaps: false,
          src: resolve(process.cwd(), 'src', 'index.js'),
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
      'Invalid snap config file: At path: foo -- Expected a value of type `never`, but received: `"bar"',
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
      input: resolve(process.cwd(), 'src', 'index.js'),
    });
  });

  it('resolves a TypeScript config in the provided directory', async () => {
    expect(
      await resolveConfig(resolve(CONFIG_PATH, 'typescript')),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      input: resolve(process.cwd(), 'src', 'index.ts'),
    });
  });

  it('throws an error if no config is found', async () => {
    await expect(resolveConfig()).rejects.toThrow(
      /Could not find a "snap\.config\.js" or "snap\.config\.ts" file in the current or specified directory \(".*"\)\./u,
    );
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

describe('mergeLegacyOptions', () => {
  it('merges the argv with the config', () => {
    expect(
      mergeLegacyOptions(
        // @ts-expect-error - Partial `argv`.
        {
          src: 'src/index.ts',
          port: 8000,
        },
        {
          cliOptions: {
            src: 'src/index.js',
            port: 9000,
            writeManifest: true,
          },
        },
      ),
    ).toStrictEqual({
      cliOptions: {
        port: 8000,
        src: 'src/index.ts',
        writeManifest: true,
      },
    });
  });
});
