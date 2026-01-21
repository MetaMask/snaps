import { getPlatformVersion } from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  DEFAULT_SNAP_ICON,
  getMockSnapFilesWithUpdatedChecksum,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import normalFs from 'fs';
import { dirname } from 'path';
import type { Configuration } from 'webpack';

import { build } from './implementation';
import { getMockConfig } from '../../test-utils';
import { getCompiler } from '../../webpack';
import type * as webpack from '../../webpack';
import type * as utils from '../../webpack/utils';
import { BROWSERSLIST_FILE } from '../../webpack/utils';

const { promises: fs } = normalFs;

jest.mock('fs');

jest.mock('../../webpack', () => ({
  ...jest.requireActual('../../webpack'),
  getCompiler: jest.fn<
    ReturnType<typeof getCompiler>,
    Parameters<typeof getCompiler>
  >(async (...args) => {
    const compiler = await jest
      .requireActual<typeof webpack>('../../webpack')
      .getCompiler(...args);

    // @ts-expect-error: Type mismatch.
    compiler.inputFileSystem = normalFs;

    // @ts-expect-error: Type mismatch.
    compiler.outputFileSystem = normalFs;

    return compiler;
  }),
}));

jest.mock('../../webpack/utils', () => ({
  ...jest.requireActual('../../webpack/utils'),
  getDefaultLoader: jest.fn<
    ReturnType<typeof utils.getDefaultLoader>,
    Parameters<typeof utils.getDefaultLoader>
  >(async (config) => {
    return jest
      .requireActual<typeof utils>('../../webpack/utils')
      .getDefaultLoader(config);
  }),
}));

describe('build', () => {
  beforeEach(async () => {
    const { manifest } = await getMockSnapFilesWithUpdatedChecksum({
      manifest: getSnapManifest({
        platformVersion: getPlatformVersion(),
      }),
    });

    await fs.mkdir('/snap');
    await fs.writeFile('/snap/input.js', DEFAULT_SNAP_BUNDLE);
    await fs.writeFile(
      '/snap/snap.manifest.json',
      JSON.stringify(manifest.result),
    );
    await fs.writeFile('/snap/package.json', JSON.stringify(getPackageJson()));
    await fs.mkdir('/snap/images');
    await fs.writeFile('/snap/images/icon.svg', DEFAULT_SNAP_ICON);
    await fs.mkdir(dirname(BROWSERSLIST_FILE), { recursive: true });
    await fs.writeFile(
      BROWSERSLIST_FILE,
      await jest
        .requireActual<typeof normalFs>('fs')
        .promises.readFile(BROWSERSLIST_FILE),
    );
  });

  afterEach(async () => {
    await fs.rm('/snap', { force: true, recursive: true });
  });

  it('builds the snap bundle using Webpack', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    const config = getMockConfig({
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

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /Compiled \d+ files? in \d+ms with \d+ warnings?\./u,
      ),
    );

    const output = await fs.readFile('/snap/output.js', 'utf8');
    expect(output).toMatchInlineSnapshot(
      `"(()=>{var r={157:r=>{r.exports.onRpcRequest=({request:r})=>{console.log("Hello, world!");const{method:e,id:o}=r;return e+o}}},e={};var o=function o(t){var s=e[t];if(void 0!==s)return s.exports;var n=e[t]={exports:{}};return r[t](n,n.exports,o),n.exports}(157);module.exports=o})();"`,
    );
  });

  it('builds an unminimized snap bundle using Webpack', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    const config = getMockConfig({
      input: '/snap/input.js',
      output: {
        path: './',
        filename: 'output.js',
        minimize: false,
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

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /Compiled \d+ files? in \d+ms with \d+ warnings?\./u,
      ),
    );

    const output = await fs.readFile('/snap/output.js', 'utf8');
    expect(output).toMatchInlineSnapshot(`
      "(() => {
        var __webpack_modules__ = {
          157: module => {
            module.exports.onRpcRequest = ({
              request
            }) => {
              console.log("Hello, world!");
              const {
                method,
                id
              } = request;
              return method + id;
            };
          }
        };
        var __webpack_module_cache__ = {};
        function __webpack_require__(moduleId) {
          var cachedModule = __webpack_module_cache__[moduleId];
          if (cachedModule !== undefined) {
            return cachedModule.exports;
          }
          var module = __webpack_module_cache__[moduleId] = {
            exports: {}
          };
          __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
          return module.exports;
        }
        var __webpack_exports__ = __webpack_require__(157);
        module.exports = __webpack_exports__;
      })();"
    `);
  });

  it('builds a preinstalled bundle using Webpack', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue('/snap');

    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const log = jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig({
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

    await build(config, {
      preinstalled: true,
      preinstalledOptions: {
        hidden: true,
        hideSnapBranding: false,
        removable: true,
      },
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /Compiled \d+ files? in \d+ms with \d+ warnings?\./u,
      ),
    );

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining('Creating preinstalled Snap bundle.'),
    );

    const output = await fs.readFile('/snap/output.js', 'utf8');
    expect(output).toMatchInlineSnapshot(
      `"(()=>{var r={157:r=>{r.exports.onRpcRequest=({request:r})=>{console.log("Hello, world!");const{method:e,id:o}=r;return e+o}}},e={};var o=function o(t){var s=e[t];if(void 0!==s)return s.exports;var n=e[t]={exports:{}};return r[t](n,n.exports,o),n.exports}(157);module.exports=o})();"`,
    );

    const preinstalledBundle = await fs.readFile(
      '/snap/preinstalled-snap.json',
      'utf8',
    );

    expect(JSON.parse(preinstalledBundle)).toMatchInlineSnapshot(`
      {
        "files": [
          {
            "path": "dist/bundle.js",
            "value": "(()=>{var r={157:r=>{r.exports.onRpcRequest=({request:r})=>{console.log("Hello, world!");const{method:e,id:o}=r;return e+o}}},e={};var o=function o(t){var s=e[t];if(void 0!==s)return s.exports;var n=e[t]={exports:{}};return r[t](n,n.exports,o),n.exports}(157);module.exports=o})();",
          },
          {
            "path": "images/icon.svg",
            "value": "<svg />",
          },
        ],
        "hidden": true,
        "hideSnapBranding": false,
        "manifest": {
          "description": "The test example snap!",
          "initialPermissions": {
            "endowment:rpc": {
              "dapps": false,
              "snaps": true,
            },
            "snap_dialog": {},
          },
          "manifestVersion": "0.1",
          "platformVersion": "10.3.0",
          "proposedName": "@metamask/example-snap",
          "repository": {
            "type": "git",
            "url": "https://github.com/MetaMask/example-snap.git",
          },
          "source": {
            "location": {
              "npm": {
                "filePath": "dist/bundle.js",
                "iconPath": "images/icon.svg",
                "packageName": "@metamask/example-snap",
                "registry": "https://registry.npmjs.org",
              },
            },
            "shasum": "Epw19dYZycnk/gHOyZfra1nZHwx8+pFs9tgOxzvXoUg=",
          },
          "version": "1.0.0",
        },
        "removable": true,
        "snapId": "npm:@metamask/example-snap",
      }
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

    await expect(build(getMockConfig())).rejects.toThrow(error);
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

    await expect(build(getMockConfig())).rejects.toThrow(error);
  });
});
