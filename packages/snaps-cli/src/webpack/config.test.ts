import ora from 'ora';

import { getMockConfig } from '../test-utils';
import { getDefaultConfiguration } from './config';

jest.dontMock('fs');

describe('getDefaultConfiguration', () => {
  it.each([
    getMockConfig('webpack', {
      input: 'src/index.js',
      output: {
        path: '/foo/bar',
      },
      manifest: {
        path: '/foo/snap.manifest.json',
      },
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: '/bar/baz',
      },
      manifest: {
        path: '/bar/snap.manifest.json',
      },
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: '/bar/baz',
      },
      manifest: {
        path: '/bar/snap.manifest.json',
      },
      plugins: {
        bundleWarnings: false,
      },
      sourceMap: 'inline',
    }),
    getMockConfig('webpack', {
      input: 'src/index.ts',
      output: {
        path: '/bar/baz',
      },
      manifest: {
        path: '/bar/snap.manifest.json',
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
  ])(
    'returns the default Webpack configuration for the given CLI config',
    (config) => {
      jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(getDefaultConfiguration(config)).toMatchSnapshot();
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
    'returns the default Webpack configuration for the options %o',
    (options) => {
      jest.spyOn(process, 'cwd').mockReturnValue('/foo/bar');

      const config = getMockConfig('webpack');

      // eslint-disable-next-line jest/no-restricted-matchers
      expect(getDefaultConfiguration(config, options)).toMatchSnapshot();
    },
  );
});
