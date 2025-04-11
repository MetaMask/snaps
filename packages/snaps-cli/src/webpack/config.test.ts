import { promises as fs } from 'fs';
import ora from 'ora';
import { dirname } from 'path';

import { getDefaultConfiguration } from './config';
import { getMockConfig, normalizeConfig } from '../test-utils';

jest.mock('fs');
jest.mock('path', () => ({
  // For compatibility with Windows, we make `path` always use POSIX-style
  // paths.
  ...jest.requireActual('path/posix'),
  resolve: (first: string, ...rest: string[]) => {
    const realResolve = jest.requireActual('path/posix').resolve;

    if (first === __dirname) {
      return realResolve('/foo/bar', ...rest);
    }

    return realResolve(first, ...rest);
  },
}));

jest.mock('module', () => ({
  // Built-in modules are different across Node versions, so we need to mock
  // them out.
  builtinModules: ['fs', 'path', 'buffer'],
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  BROWSERSLIST_FILE: '/foo/bar/.browserslistrc',
}));

jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

describe('getDefaultConfiguration', () => {
  beforeAll(async () => {
    const actualFile = jest.requireActual('./utils').BROWSERSLIST_FILE;
    await fs.mkdir(dirname(actualFile), { recursive: true });
    await fs.writeFile(actualFile, 'chrome >= 90\nfirefox >= 91\n');
  });

  it.each([
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
    }),
    getMockConfig({
      input: 'src/index.ts',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      stats: {
        verbose: true,
      },
    }),
    getMockConfig({
      input: 'src/index.ts',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      stats: {
        buffer: false,
      },
      sourceMap: 'inline',
    }),
    getMockConfig({
      input: 'src/index.ts',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      environment: {
        FOO: 'bar',
      },
      stats: {
        builtIns: false,
        buffer: false,
      },
      sourceMap: true,
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      experimental: {
        wasm: true,
      },
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
        minimize: false,
      },
      manifest: {
        path: 'snap.manifest.json',
      },
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
        minimize: false,
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      polyfills: false,
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
        minimize: false,
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      polyfills: true,
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
        minimize: false,
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      polyfills: {
        buffer: true,
      },
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
        minimize: false,
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      features: {
        images: false,
      },
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      typescript: {
        enabled: true,
      },
    }),
    getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      typescript: {
        enabled: true,
        configFile: './foo/bar/tsconfig.json',
      },
    }),
  ])(
    'returns the default Webpack configuration for the given CLI config',
    async (config) => {
      jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

      const output = await getDefaultConfiguration(config);

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(normalizeConfig(output)).toMatchSnapshot();
    },
  );

  it('returns the default Webpack configuration when `analyze` is `true`', async () => {
    const config = getMockConfig({
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
    });

    jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

    const output = await getDefaultConfiguration(config, { analyze: true });

    // eslint-disable-next-line jest/no-restricted-matchers
    expect(normalizeConfig(output)).toMatchSnapshot();
  });

  it.each([
    {
      evaluate: true,
      watch: true,
    },
    {
      evaluate: false,
      watch: false,
    },
    {
      evaluate: true,
      watch: false,
    },
    {
      evaluate: false,
      watch: true,
    },
    {
      evaluate: true,
      watch: true,
      spinner: ora(),
    },
  ])(
    'returns the default Webpack configuration for the given CLI config and options',
    async (options) => {
      const config = getMockConfig({
        input: 'src/index.ts',
        output: {
          path: '/bar/baz',
        },
        manifest: {
          path: '/bar/snap.manifest.json',
        },
      });

      const output = await getDefaultConfiguration(config, options);

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(normalizeConfig(output)).toMatchSnapshot();
    },
  );
});
