"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkNGS23BTRjs = require('./chunk-NGS23BTR.js');



var _chunkC46KEPACjs = require('./chunk-C46KEPAC.js');


var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/config.ts
var _snapssdk = require('@metamask/snaps-sdk');






var _node = require('@metamask/snaps-utils/node');















var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
var _core = require('@swc/core');
var _chalk = require('chalk');
var _promises = require('fs/promises');
var _module = require('module'); var _module2 = _interopRequireDefault(_module);
var _path = require('path');
var CONFIG_FILES = [_chunkC46KEPACjs.CONFIG_FILE, _chunkC46KEPACjs.TS_CONFIG_FILE];
var SnapsBrowserifyBundlerCustomizerFunctionStruct = _superstruct.define.call(void 0, 
  "function",
  _superstruct.func.call(void 0, ).validator
);
var SnapsBrowserifyConfigStruct = _superstruct.object.call(void 0, {
  bundler: _snapssdk.literal.call(void 0, "browserify"),
  cliOptions: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      bundle: _superstruct.optional.call(void 0, _chunkNGS23BTRjs.file.call(void 0, )),
      dist: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), "dist"),
      eval: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      manifest: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      port: _superstruct.defaulted.call(void 0, _superstruct.number.call(void 0, ), 8081),
      outfileName: _superstruct.defaulted.call(void 0, _superstruct.string.call(void 0, ), "bundle.js"),
      root: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), process.cwd()),
      sourceMaps: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
      src: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), "src/index.js"),
      stripComments: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      suppressWarnings: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
      transpilationMode: _superstruct.defaulted.call(void 0, 
        _snapssdk.union.call(void 0, [_snapssdk.literal.call(void 0, "localAndDeps"), _snapssdk.literal.call(void 0, "localOnly"), _snapssdk.literal.call(void 0, "none")]),
        "localOnly"
      ),
      depsToTranspile: _superstruct.defaulted.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )), []),
      verboseErrors: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      writeManifest: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      serve: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true)
    }),
    {}
  ),
  bundlerCustomizer: _superstruct.optional.call(void 0, SnapsBrowserifyBundlerCustomizerFunctionStruct)
});
var SnapsWebpackCustomizeWebpackConfigFunctionStruct = _superstruct.define.call(void 0, 
  "function",
  _superstruct.func.call(void 0, ).validator
);
var SnapsWebpackConfigStruct = _superstruct.object.call(void 0, {
  bundler: _superstruct.defaulted.call(void 0, _snapssdk.literal.call(void 0, "webpack"), "webpack"),
  input: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), _path.resolve.call(void 0, process.cwd(), "src/index.js")),
  sourceMap: _superstruct.defaulted.call(void 0, _snapssdk.union.call(void 0, [_superstruct.boolean.call(void 0, ), _snapssdk.literal.call(void 0, "inline")]), false),
  evaluate: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
  output: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      path: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), _path.resolve.call(void 0, process.cwd(), "dist")),
      filename: _superstruct.defaulted.call(void 0, _superstruct.string.call(void 0, ), "bundle.js"),
      clean: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
      minimize: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true)
    }),
    {}
  ),
  manifest: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      path: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), _path.resolve.call(void 0, process.cwd(), "snap.manifest.json")),
      update: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true)
    }),
    {}
  ),
  server: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      enabled: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true),
      root: _superstruct.defaulted.call(void 0, _chunkNGS23BTRjs.file.call(void 0, ), process.cwd()),
      port: _superstruct.defaulted.call(void 0, _superstruct.number.call(void 0, ), 8081)
    }),
    {}
  ),
  environment: _superstruct.defaulted.call(void 0, _superstruct.record.call(void 0, _superstruct.string.call(void 0, ), _superstruct.unknown.call(void 0, )), {}),
  stats: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      verbose: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
      builtIns: _superstruct.defaulted.call(void 0, 
        _snapssdk.union.call(void 0, [
          _superstruct.object.call(void 0, { ignore: _superstruct.defaulted.call(void 0, _superstruct.array.call(void 0, _superstruct.string.call(void 0, )), []) }),
          _snapssdk.literal.call(void 0, false)
        ]),
        {}
      ),
      buffer: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true)
    }),
    {}
  ),
  polyfills: _superstruct.defaulted.call(void 0, 
    _snapssdk.union.call(void 0, [
      _superstruct.boolean.call(void 0, ),
      _superstruct.object.call(void 0, {
        assert: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        buffer: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        console: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        constants: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        crypto: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        domain: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        events: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        http: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        https: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        os: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        path: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        punycode: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        process: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        querystring: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        stream: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        /* eslint-disable @typescript-eslint/naming-convention */
        _stream_duplex: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        _stream_passthrough: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        _stream_readable: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        _stream_transform: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        _stream_writable: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        string_decoder: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        /* eslint-enable @typescript-eslint/naming-convention */
        sys: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        timers: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        tty: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        url: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        util: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        vm: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false),
        zlib: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false)
      })
    ]),
    false
  ),
  features: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      images: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), true)
    }),
    {}
  ),
  customizeWebpackConfig: _superstruct.optional.call(void 0, 
    SnapsWebpackCustomizeWebpackConfigFunctionStruct
  ),
  experimental: _superstruct.defaulted.call(void 0, 
    _superstruct.object.call(void 0, {
      wasm: _superstruct.defaulted.call(void 0, _superstruct.boolean.call(void 0, ), false)
    }),
    {}
  )
});
var SnapsConfigStruct = _superstruct.type.call(void 0, {
  bundler: _superstruct.defaulted.call(void 0, 
    _snapssdk.union.call(void 0, [_snapssdk.literal.call(void 0, "browserify"), _snapssdk.literal.call(void 0, "webpack")]),
    "webpack"
  )
});
var LegacyOptionsStruct = _snapssdk.union.call(void 0, [
  _node.named.call(void 0, 
    "object with `transpilationMode` set to `localAndDeps` and `depsToTranspile` set to an array of strings",
    _superstruct.type.call(void 0, {
      depsToTranspile: _superstruct.array.call(void 0, _superstruct.string.call(void 0, )),
      transpilationMode: _snapssdk.literal.call(void 0, "localAndDeps" /* LocalAndDeps */),
      writeManifest: _superstruct.boolean.call(void 0, ),
      bundlerCustomizer: _superstruct.optional.call(void 0, 
        SnapsBrowserifyBundlerCustomizerFunctionStruct
      )
    })
  ),
  _node.named.call(void 0, 
    "object without `depsToTranspile`",
    _superstruct.type.call(void 0, {
      depsToTranspile: _node.named.call(void 0, "empty array", _superstruct.empty.call(void 0, _superstruct.array.call(void 0, ))),
      transpilationMode: _snapssdk.union.call(void 0, [
        _snapssdk.literal.call(void 0, "localOnly" /* LocalOnly */),
        _snapssdk.literal.call(void 0, "none" /* None */)
      ]),
      writeManifest: _superstruct.boolean.call(void 0, ),
      bundlerCustomizer: _superstruct.optional.call(void 0, 
        SnapsBrowserifyBundlerCustomizerFunctionStruct
      )
    })
  )
]);
function getConfig(config, argv) {
  const prefix = "The snap config file is invalid";
  const suffix = _chalk.dim.call(void 0, 
    "Refer to the documentation for more information: https://docs.metamask.io/snaps/reference/cli/options/"
  );
  const { bundler } = _node.createFromStruct.call(void 0, 
    config,
    SnapsConfigStruct,
    prefix,
    suffix
  );
  if (bundler === "browserify") {
    const legacyConfig = _node.createFromStruct.call(void 0, 
      config,
      SnapsBrowserifyConfigStruct,
      prefix,
      suffix
    );
    return getWebpackConfig(mergeLegacyOptions(argv, legacyConfig));
  }
  return _node.createFromStruct.call(void 0, config, SnapsWebpackConfigStruct, prefix, suffix);
}
async function loadConfig(path, argv) {
  try {
    const contents = await _promises.readFile.call(void 0, path, "utf8");
    const source = await _core.transform.call(void 0, contents, {
      swcrc: false,
      jsc: {
        parser: {
          syntax: "typescript"
        }
      },
      module: {
        type: "commonjs"
      }
    });
    const config = new (0, _module2.default)(path);
    config.paths = _module2.default._nodeModulePaths(_path.dirname.call(void 0, path));
    config._compile(source.code, path);
    if (!_utils.hasProperty.call(void 0, config.exports, "default")) {
      return getConfig(config.exports, argv);
    }
    return getConfig(config.exports.default, argv);
  } catch (error) {
    if (error instanceof _node.SnapsStructError) {
      throw new (0, _chunkBALQOCUOjs.ConfigError)(error.message);
    }
    throw new (0, _chunkBALQOCUOjs.ConfigError)(
      `Unable to load snap config file at "${path}".

${_node.indent.call(void 0, 
        error.message
      )}`
    );
  }
}
async function resolveConfig(path, argv) {
  for (const configFile of CONFIG_FILES) {
    const filePath = _path.resolve.call(void 0, path, configFile);
    if (await _node.isFile.call(void 0, filePath)) {
      return await loadConfig(filePath, argv);
    }
  }
  throw new (0, _chunkBALQOCUOjs.ConfigError)(
    `Could not find a "snap.config.js" or "snap.config.ts" file in the current or specified directory ("${path}").`
  );
}
async function getConfigByArgv(argv, cwd = process.cwd()) {
  if (argv.config) {
    if (!await _node.isFile.call(void 0, argv.config)) {
      throw new (0, _chunkBALQOCUOjs.ConfigError)(
        `Could not find a config file at "${argv.config}". Make sure that the path is correct.`
      );
    }
    return await loadConfig(argv.config, argv);
  }
  return await resolveConfig(cwd, argv);
}
function mergeLegacyOptions(argv, config) {
  const cliOptions = Object.keys(config.cliOptions).reduce((accumulator, key) => {
    if (argv[key] !== void 0) {
      return {
        ...accumulator,
        [key]: argv[key]
      };
    }
    return accumulator;
  }, config.cliOptions);
  return {
    ...config,
    cliOptions
  };
}
function getWebpackConfig(legacyConfig) {
  const defaultConfig = _superstruct.create.call(void 0, 
    { bundler: "webpack" },
    SnapsWebpackConfigStruct
  );
  const path = legacyConfig.cliOptions.bundle ? _path.dirname.call(void 0, legacyConfig.cliOptions.bundle) : legacyConfig.cliOptions.dist;
  const filename = legacyConfig.cliOptions.bundle ? _path.basename.call(void 0, legacyConfig.cliOptions.bundle) : legacyConfig.cliOptions.outfileName;
  return {
    ...defaultConfig,
    input: legacyConfig.cliOptions.src,
    evaluate: legacyConfig.cliOptions.eval,
    sourceMap: legacyConfig.cliOptions.sourceMaps,
    output: {
      path,
      filename,
      // The legacy config has an option to remove comments from the bundle, but
      // the terser plugin does this by default, so we only enable the terser if
      // the legacy config has `stripComments` set to `true`. This is not a
      // perfect solution, but it's the best we can do without breaking the
      // legacy config.
      minimize: legacyConfig.cliOptions.stripComments,
      // The legacy config does not have a `clean` option, so we default to
      // `false` here.
      clean: false
    },
    manifest: {
      // The legacy config does not have a `manifest` option, so we default to
      // `process.cwd()/snap.manifest.json`.
      path: _path.resolve.call(void 0, process.cwd(), "snap.manifest.json"),
      update: legacyConfig.cliOptions.writeManifest
    },
    server: {
      enabled: legacyConfig.cliOptions.serve,
      port: legacyConfig.cliOptions.port,
      root: legacyConfig.cliOptions.root
    },
    stats: {
      verbose: false,
      // These plugins are designed to be used with the modern config format, so
      // we disable them for the legacy config format.
      builtIns: false,
      buffer: false
    },
    legacy: _node.createFromStruct.call(void 0, 
      {
        ...legacyConfig.cliOptions,
        bundlerCustomizer: legacyConfig.bundlerCustomizer
      },
      LegacyOptionsStruct,
      "Invalid Browserify CLI options"
    )
  };
}












exports.SnapsBrowserifyConfigStruct = SnapsBrowserifyConfigStruct; exports.SnapsWebpackConfigStruct = SnapsWebpackConfigStruct; exports.SnapsConfigStruct = SnapsConfigStruct; exports.LegacyOptionsStruct = LegacyOptionsStruct; exports.getConfig = getConfig; exports.loadConfig = loadConfig; exports.resolveConfig = resolveConfig; exports.getConfigByArgv = getConfigByArgv; exports.mergeLegacyOptions = mergeLegacyOptions; exports.getWebpackConfig = getWebpackConfig;
//# sourceMappingURL=chunk-D2ZIM5W2.js.map