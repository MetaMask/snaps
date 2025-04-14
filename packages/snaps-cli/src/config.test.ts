import { bold, red } from 'chalk';
import { resolve } from 'path';

import {
  getConfig,
  getConfigByArgv,
  loadConfig,
  resolveConfig,
} from './config';
import { getMockConfig } from './test-utils';

const CONFIG_PATH = resolve(__dirname, '__fixtures__', 'configs');
const DEFAULT_CONFIG = getMockConfig();

describe('getConfig', () => {
  it('throws an error if `cliOptions` is being used with `webpack`', () => {
    expect(() =>
      getConfig({
        input: 'foo',
        cliOptions: { port: 8000 },
      }),
    ).toThrow(`Unknown key: ${bold('cliOptions')}, received:`);
  });

  it.each([
    {
      input: 'src/index.js',
      sourceMap: false,
      output: {
        path: 'dist',
      },
      server: {
        port: 8081,
      },
    },
    {
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      server: {
        port: 8081,
      },
    },
    {
      input: 'src/index.js',
      server: {
        port: 8081,
      },
    },
    {
      input: 'src/index.js',
      output: {},
    },
    {
      input: 'src/index.js',
    },
    {},
  ])('returns a valid config for `%o`', (value) => {
    const config = getConfig(value);

    expect(config).toStrictEqual(
      getMockConfig({
        input: resolve(process.cwd(), 'src', 'index.js'),
      }),
    );
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
      `Unknown key: ${bold('foo')}, received: ${red('"bar"')}.`,
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
    await expect(resolveConfig(process.cwd())).rejects.toThrow(
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
