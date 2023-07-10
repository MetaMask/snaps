import {
  DEFAULT_SNAP_BUNDLE,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';
import normalFs from 'fs';
import { dirname, resolve } from 'path';
import { Configuration } from 'webpack';

import { ProcessedConfig } from '../../config';
import { getMockConfig } from '../../test-utils';
import { getCompiler } from '../../webpack';
import utils, { BROWSERSLIST_FILE } from '../../webpack/utils';
import { build } from './implementation';

const { promises: fs } = normalFs;

const BROWSERIFY_LOADER_PATH = resolve(
  __dirname,
  '../../webpack/loaders/browserify.ts',
);

jest.mock('fs');

jest.mock('../../webpack', () => ({
  ...jest.requireActual('../../webpack'),
  getCompiler: jest.fn<
    ReturnType<typeof getCompiler>,
    Parameters<typeof getCompiler>
  >(async (...args) => {
    const compiler = await jest
      .requireActual<typeof import('../../webpack')>('../../webpack')
      .getCompiler(...args);

    compiler.inputFileSystem = normalFs;
    compiler.outputFileSystem = normalFs;

    return compiler;
  }),
}));

jest.mock('../../webpack/utils', () => ({
  ...jest.requireActual('../../webpack/utils'),
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
    await fs.mkdir(dirname(BROWSERSLIST_FILE), { recursive: true });
    await fs.writeFile(
      BROWSERSLIST_FILE,
      await jest
        .requireActual<typeof normalFs>('fs')
        .promises.readFile(BROWSERSLIST_FILE),
    );

    await fs.mkdir(dirname(BROWSERIFY_LOADER_PATH), { recursive: true });
    await fs.writeFile(
      BROWSERIFY_LOADER_PATH,
      await jest
        .requireActual<typeof normalFs>('fs')
        .promises.readFile(BROWSERIFY_LOADER_PATH),
    );
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

  it('builds the snap bundle using a legacy config', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const log = jest.spyOn(console, 'log').mockImplementation();

    jest.spyOn(utils, 'getDefaultLoader').mockImplementation((_config) => {
      const config = _config as ProcessedConfig;
      assert(config.legacy);

      return {
        loader: BROWSERIFY_LOADER_PATH,
        options: config.legacy,
      };
    });

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: '/snap/input.js',
        dist: '/snap',
        outfileName: 'output.js',
        eval: false,
      },
    });

    await build(config);

    expect(log).toHaveBeenCalledWith(
      expect.stringMatching(/Compiled 1 files in \d+ms\./u),
    );

    const output = await fs.readFile('/snap/output.js', 'utf8');
    expect(output).toMatchInlineSnapshot(
      `"(()=>{var r={484:r=>{r.exports=function(){function r(e,o,t){function n(s,i){if(!o[s]){if(!e[s]){if(u)return u(s,!0);var f=new Error("Cannot find module '"+s+"'");throw f.code="MODULE_NOT_FOUND",f}var c=o[s]={exports:{}};e[s][0].call(c.exports,(function(r){return n(e[s][1][r]||r)}),c,c.exports,r,e,o,t)}return o[s].exports}for(var u=void 0,s=0;s<t.length;s++)n(t[s]);return n}return r}()({1:[function(r,e,o){"use strict";e.exports.onRpcRequest=({request:r})=>{console.log("Hello, world!");const{method:e,id:o}=r;return e+o}},{}]},{},[1])(1)}},e={};var o=function o(t){var n=e[t];if(void 0!==n)return n.exports;var u=e[t]={exports:{}};return r[t](u,u.exports,o),u.exports}(484),t=exports;for(var n in o)t[n]=o[n];o.__esModule&&Object.defineProperty(t,"__esModule",{value:!0})})();"`,
    );
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
