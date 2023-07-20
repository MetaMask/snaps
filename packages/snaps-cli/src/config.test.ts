import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import type { BrowserifyObject } from 'browserify';
import { bold, green, red } from 'chalk';
import { resolve } from 'path';

import { TranspilationModes } from './builders';
import {
  getConfig,
  getConfigByArgv,
  loadConfig,
  mergeLegacyOptions,
  resolveConfig,
} from './config';
import type { YargsArgs } from './types/yargs';

const CONFIG_PATH = resolve(__dirname, '__fixtures__', 'configs');
const DEFAULT_CONFIG = getMockConfig('webpack');
const MOCK_ARGV = {} as YargsArgs;

describe('getConfig', () => {
  it('throws an error if `bundler` is not `browserify` or `webpack`', () => {
    expect(() => getConfig({ bundler: 'foo' }, MOCK_ARGV)).toThrow(
      `At path: ${bold('bundler')} — Expected the value to be one of: ${green(
        '"browserify"',
      )}, ${green('"webpack"')}, but received: ${red('"foo"')}.`,
    );
  });

  it('throws an error if `entry` is being used with `browserify`', () => {
    expect(() =>
      getConfig(
        {
          bundler: 'browserify',
          entry: 'foo',
        },
        MOCK_ARGV,
      ),
    ).toThrow(`Unknown key: ${bold('entry')}, received: ${red('"foo"')}.`);
  });

  it('throws an error if `cliOptions` is being used with `webpack`', () => {
    expect(() =>
      getConfig(
        {
          bundler: 'webpack',
          input: 'foo',
          cliOptions: { port: 8000 },
        },
        MOCK_ARGV,
      ),
    ).toThrow(`Unknown key: ${bold('cliOptions')}, received:`);
  });

  describe('browserify', () => {
    it.each([
      {
        bundler: 'browserify',
        cliOptions: {
          src: 'src/index.js',
          port: 8081,
          transpilationMode: TranspilationModes.LocalAndDeps,
          depsToTranspile: ['foo', 'bar'],
        },
        bundlerCustomizer: (browserify: BrowserifyObject) => {
          browserify.plugin('foo');
        },
      },
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
      const config = getConfig(value, MOCK_ARGV);

      expect(config.legacy).toStrictEqual({
        bundlerCustomizer: value.bundlerCustomizer ?? undefined,
        depsToTranspile: value.cliOptions?.depsToTranspile ?? [],
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
        transpilationMode:
          value.cliOptions?.transpilationMode ?? TranspilationModes.LocalOnly,
        verboseErrors: true,
        writeManifest: true,
      });
    });

    it('throws when trying to use `depsToTranspile` with `transpilationMode` not set to `LocalAndDeps`', () => {
      expect(() =>
        getConfig(
          {
            cliOptions: {
              depsToTranspile: ['foo', 'bar'],
              transpilationMode: TranspilationModes.LocalOnly,
            },
          },
          MOCK_ARGV,
        ),
      ).toThrow('Invalid Browserify CLI options.');
    });
  });
});

describe('loadConfig', () => {
  it('loads an ESM-based config', async () => {
    expect(
      await loadConfig(resolve(CONFIG_PATH, 'esm.ts'), MOCK_ARGV),
    ).toStrictEqual(DEFAULT_CONFIG);
  });

  it('loads a CJS-based config', async () => {
    expect(
      await loadConfig(resolve(CONFIG_PATH, 'cjs.ts'), MOCK_ARGV),
    ).toStrictEqual(DEFAULT_CONFIG);
  });

  it('throws an error if the config is invalid', async () => {
    await expect(
      loadConfig(resolve(CONFIG_PATH, 'invalid.ts'), MOCK_ARGV),
    ).rejects.toThrow(
      `Unknown key: ${bold('foo')}, received: ${red('"bar"')}.`,
    );
  });

  it('throws an error if the config is not JavaScript or TypeScript', async () => {
    await expect(
      loadConfig(resolve(CONFIG_PATH, 'invalid.json'), MOCK_ARGV),
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
      await resolveConfig(resolve(CONFIG_PATH, 'javascript'), MOCK_ARGV),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      input: resolve(process.cwd(), 'src', 'index.js'),
    });
  });

  it('resolves a TypeScript config in the provided directory', async () => {
    expect(
      await resolveConfig(resolve(CONFIG_PATH, 'typescript'), MOCK_ARGV),
    ).toStrictEqual({
      ...DEFAULT_CONFIG,
      input: resolve(process.cwd(), 'src', 'index.ts'),
    });
  });

  it('throws an error if no config is found', async () => {
    await expect(resolveConfig(process.cwd(), MOCK_ARGV)).rejects.toThrow(
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
          serve: false,
        },
        {
          cliOptions: {
            src: 'src/index.js',
            port: 9000,
            writeManifest: true,
            serve: true,
          },
        },
      ),
    ).toStrictEqual({
      cliOptions: {
        port: 8000,
        src: 'src/index.ts',
        writeManifest: true,
        serve: false,
      },
    });
  });
});
