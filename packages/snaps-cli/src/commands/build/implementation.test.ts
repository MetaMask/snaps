import {
  DEFAULT_SNAP_BUNDLE,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import normalFs from 'fs';
import { Configuration } from 'webpack';

import { getMockConfig } from '../../test-utils';
import { getCompiler } from '../../webpack';
import { build } from './implementation';

const { promises: fs } = normalFs;

jest.mock('fs');

jest.mock('../../webpack', () => ({
  ...jest.requireActual('../../webpack'),
  getCompiler: jest.fn<
    ReturnType<typeof getCompiler>,
    Parameters<typeof getCompiler>
  >((...args) => {
    const compiler = jest
      .requireActual<typeof import('../../webpack')>('../../webpack')
      .getCompiler(...args);

    compiler.inputFileSystem = normalFs;
    compiler.outputFileSystem = normalFs;

    return compiler;
  }),
}));

describe('build', () => {
  beforeEach(async () => {
    await fs.mkdir('/snap');
    await fs.writeFile('/snap/input.js', DEFAULT_SNAP_BUNDLE);
    await fs.writeFile(
      '/snap/snap.manifest.json',
      JSON.stringify(getSnapManifest()),
    );
    await fs.writeFile('/snap/package.json', JSON.stringify(getPackageJson()));
    await fs.mkdir('/snap/images');
    await fs.writeFile('/snap/images/icon.svg', '<svg></svg>');
  });

  afterEach(async () => {
    await fs.rm('/snap', { force: true, recursive: true });
  });

  it('builds the snap bundle using Webpack', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const log = jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('webpack', {
      input: '/snap/input.js',
      output: {
        path: './',
        filename: 'output.js',
      },
      evaluate: false,
      manifest: {
        path: '/snap/snap.manifest.json',
      },
      customizeWebpackConfig: (webpackConfig: Configuration) => {
        delete webpackConfig.module?.rules;
        return webpackConfig;
      },
    });

    await build(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Compiled 1 files in \d+ms\./u),
    );

    const output = await fs.readFile('/snap/output.js', 'utf8');
    expect(output).toMatchInlineSnapshot(`
      "(()=>{var e={67:e=>{e.exports.onRpcRequest=({request:e})=>{console.log("Hello, world!");const{method:r,id:o}=e;return r+o}}},r={};var o=function o(t){var s=r[t];if(void 0!==s)return s.exports;var n=r[t]={exports:{}};return e[t](n,n.exports,o),n.exports}(67),t=exports;for(var s in o)t[s]=o[s];o.__esModule&&Object.defineProperty(t,"__esModule",{value:!0})})();
      //# sourceMappingURL=output.js.map"
    `);
  });

  it('rejects if the compiler has an error', async () => {
    const error = new Error('Compiler error.');
    const mock = getCompiler as jest.MockedFunction<typeof getCompiler>;
    // @ts-expect-error - Partial mock.
    mock.mockImplementationOnce(() => ({
      run: jest.fn((callback) => {
        callback(error);
      }),
    }));

    await expect(build(getMockConfig('webpack'))).rejects.toThrow(error);
  });

  it('rejects if closing the compiler has an error', async () => {
    const error = new Error('Close compiler error.');
    const mock = getCompiler as jest.MockedFunction<typeof getCompiler>;
    // @ts-expect-error - Partial mock.
    mock.mockImplementationOnce(() => ({
      run: jest.fn((callback) => {
        callback(null);
      }),
      close: jest.fn((callback) => {
        callback(error);
      }),
    }));

    await expect(build(getMockConfig('webpack'))).rejects.toThrow(error);
  });
});
