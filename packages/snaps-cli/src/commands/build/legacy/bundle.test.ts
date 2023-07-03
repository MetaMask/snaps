import {
  DEFAULT_SNAP_BUNDLE,
  getPackageJson,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import { promises as fs } from 'fs';
import { join } from 'path';

import { getMockConfig } from '../../../test-utils';
import { bundle } from './bundle';

// Browserify somehow can't load files from the memory file system, so we mock
// the `fs` module to use the real file system instead for the synchronous
// methods (used by Browserify), and the memory file system for the asynchronous
// methods (used by us).
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: jest.requireActual('memfs').promises,
}));

describe('bundle', () => {
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

  it('bundles a snap with Browserify', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: join(__dirname, '__test__', 'snap.js'),
        dist: '/snap',
        outfileName: 'output.js',
        transpilationMode: 'none',
      },
    });

    expect(await bundle(config)).toBe(true);

    const file = await fs.readFile('/snap/output.js', 'utf8');
    expect(file).toMatchInlineSnapshot(`
      "(function (f) {
        if (typeof exports === "object" && typeof module !== "undefined") {
          module.exports = f();
        } else if (typeof define === "function" && define.amd) {
          define([], f);
        } else {
          var g;
          if (typeof window !== "undefined") {
            g = window;
          } else if (typeof global !== "undefined") {
            g = global;
          } else if (typeof self !== "undefined") {
            g = self;
          } else {
            g = this;
          }
          g.snap = f();
        }
      })(function () {
        var define, module, exports;
        return function () {
          function r(e, n, t) {
            function o(i, f) {
              if (!n[i]) {
                if (!e[i]) {
                  var c = "function" == typeof require && require;
                  if (!f && c) return c(i, !0);
                  if (u) return u(i, !0);
                  var a = new Error("Cannot find module '" + i + "'");
                  throw a.code = "MODULE_NOT_FOUND", a;
                }
                var p = n[i] = {
                  exports: {}
                };
                e[i][0].call(p.exports, function (r) {
                  var n = e[i][1][r];
                  return o(n || r);
                }, p, p.exports, r, e, n, t);
              }
              return n[i].exports;
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o;
          }
          return r;
        }()({
          1: [function (require, module, exports) {
            module.exports.onRpcRequest = ({
              request
            }) => {
              console.log('Hello, world!');
              const {
                method,
                id
              } = request;
              return method + id;
            };
          }, {}]
        }, {}, [1])(1);
      });"
    `);
  });

  it('bundles a snap with Browserify and Babel', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: join(__dirname, '__test__', 'snap.js'),
        dist: '/snap',
        outfileName: 'output.js',
        transpilationMode: 'localOnly',
      },
    });

    expect(await bundle(config)).toBe(true);

    const file = await fs.readFile('/snap/output.js', 'utf8');
    expect(file).toMatchInlineSnapshot(`
      "(function (f) {
        if (typeof exports === "object" && typeof module !== "undefined") {
          module.exports = f();
        } else if (typeof define === "function" && define.amd) {
          define([], f);
        } else {
          var g;
          if (typeof window !== "undefined") {
            g = window;
          } else if (typeof global !== "undefined") {
            g = global;
          } else if (typeof self !== "undefined") {
            g = self;
          } else {
            g = this;
          }
          g.snap = f();
        }
      })(function () {
        var define, module, exports;
        return function () {
          function r(e, n, t) {
            function o(i, f) {
              if (!n[i]) {
                if (!e[i]) {
                  var c = "function" == typeof require && require;
                  if (!f && c) return c(i, !0);
                  if (u) return u(i, !0);
                  var a = new Error("Cannot find module '" + i + "'");
                  throw a.code = "MODULE_NOT_FOUND", a;
                }
                var p = n[i] = {
                  exports: {}
                };
                e[i][0].call(p.exports, function (r) {
                  var n = e[i][1][r];
                  return o(n || r);
                }, p, p.exports, r, e, n, t);
              }
              return n[i].exports;
            }
            for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
            return o;
          }
          return r;
        }()({
          1: [function (require, module, exports) {
            "use strict";

            module.exports.onRpcRequest = ({
              request
            }) => {
              console.log('Hello, world!');
              const {
                method,
                id
              } = request;
              return method + id;
            };
          }, {}]
        }, {}, [1])(1);
      });"
    `);
  });

  it('rejects if an error occurred', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const config = getMockConfig('browserify', {
      cliOptions: {
        src: join(__dirname, '__test__', 'error.js'),
        dist: '/snap',
        outfileName: 'output.js',
        transpilationMode: 'localOnly',
      },
    });

    await expect(bundle(config)).rejects.toThrow(
      "Can't walk dependency graph: Cannot find module './bar'",
    );
  });

  it('customizes the bundle with a `bundlerCustomizer` function', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const bundlerCustomizer = jest.fn();
    const config = getMockConfig('browserify', {
      cliOptions: {
        src: join(__dirname, '__test__', 'snap.js'),
        dist: '/snap',
        outfileName: 'output.js',
        transpilationMode: 'localOnly',
      },
      bundlerCustomizer,
    });

    expect(await bundle(config)).toBe(true);
    expect(bundlerCustomizer).toHaveBeenCalledTimes(1);
  });
});
