import { promises as fs } from 'fs';
import ora from 'ora';
import { dirname } from 'path';

import { getMockConfig } from '../test-utils';
import { getDefaultConfiguration } from './config';
import { BROWSERSLIST_FILE } from './utils';

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
  builtinModules: ['fs', 'path'],
}));

jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

describe('getDefaultConfiguration', () => {
  beforeAll(async () => {
    await fs.mkdir(dirname(BROWSERSLIST_FILE), { recursive: true });
    await fs.writeFile(BROWSERSLIST_FILE, 'chrome >= 90\nfirefox >= 91\n');
  });

  it.each([
    getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: 'dist',
      },
      manifest: {
        path: 'snap.manifest.json',
      },
      plugins: {
        bundleWarnings: false,
      },
      sourceMap: 'inline',
    }),
    getMockConfig('webpack', {
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
      plugins: {
        bundleWarnings: false,
        builtInResolver: false,
      },
      sourceMap: true,
    }),
    getMockConfig('webpack', {
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
  ])(
    'returns the default Webpack configuration for the given CLI config',
    async (config) => {
      jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(await getDefaultConfiguration(config)).toMatchSnapshot();
    },
  );

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
      const config = getMockConfig('webpack', {
        input: 'src/index.ts',
        output: {
          path: '/bar/baz',
        },
        manifest: {
          path: '/bar/snap.manifest.json',
        },
      });

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(await getDefaultConfiguration(config, options)).toMatchSnapshot();
    },
  );
});
