import {
  file
} from "./chunk-HLSCFGA7.mjs";
import {
  CONFIG_FILE,
  TS_CONFIG_FILE
} from "./chunk-L72RLBV5.mjs";
import {
  ConfigError
} from "./chunk-X7TESUC7.mjs";

// src/config.ts
import { literal, union } from "@metamask/snaps-sdk";
import {
  createFromStruct,
  indent,
  isFile,
  SnapsStructError,
  named
} from "@metamask/snaps-utils/node";
import {
  array,
  boolean,
  create,
  defaulted,
  define,
  func,
  number,
  object,
  optional,
  record,
  string,
  type,
  unknown,
  empty
} from "@metamask/superstruct";
import { hasProperty } from "@metamask/utils";
import { transform } from "@swc/core";
import { dim } from "chalk";
import { readFile } from "fs/promises";
import Module from "module";
import { basename, dirname, resolve } from "path";
var CONFIG_FILES = [CONFIG_FILE, TS_CONFIG_FILE];
var SnapsBrowserifyBundlerCustomizerFunctionStruct = define(
  "function",
  func().validator
);
var SnapsBrowserifyConfigStruct = object({
  bundler: literal("browserify"),
  cliOptions: defaulted(
    object({
      bundle: optional(file()),
      dist: defaulted(file(), "dist"),
      eval: defaulted(boolean(), true),
      manifest: defaulted(boolean(), true),
      port: defaulted(number(), 8081),
      outfileName: defaulted(string(), "bundle.js"),
      root: defaulted(file(), process.cwd()),
      sourceMaps: defaulted(boolean(), false),
      src: defaulted(file(), "src/index.js"),
      stripComments: defaulted(boolean(), true),
      suppressWarnings: defaulted(boolean(), false),
      transpilationMode: defaulted(
        union([literal("localAndDeps"), literal("localOnly"), literal("none")]),
        "localOnly"
      ),
      depsToTranspile: defaulted(array(string()), []),
      verboseErrors: defaulted(boolean(), true),
      writeManifest: defaulted(boolean(), true),
      serve: defaulted(boolean(), true)
    }),
    {}
  ),
  bundlerCustomizer: optional(SnapsBrowserifyBundlerCustomizerFunctionStruct)
});
var SnapsWebpackCustomizeWebpackConfigFunctionStruct = define(
  "function",
  func().validator
);
var SnapsWebpackConfigStruct = object({
  bundler: defaulted(literal("webpack"), "webpack"),
  input: defaulted(file(), resolve(process.cwd(), "src/index.js")),
  sourceMap: defaulted(union([boolean(), literal("inline")]), false),
  evaluate: defaulted(boolean(), true),
  output: defaulted(
    object({
      path: defaulted(file(), resolve(process.cwd(), "dist")),
      filename: defaulted(string(), "bundle.js"),
      clean: defaulted(boolean(), false),
      minimize: defaulted(boolean(), true)
    }),
    {}
  ),
  manifest: defaulted(
    object({
      path: defaulted(file(), resolve(process.cwd(), "snap.manifest.json")),
      update: defaulted(boolean(), true)
    }),
    {}
  ),
  server: defaulted(
    object({
      enabled: defaulted(boolean(), true),
      root: defaulted(file(), process.cwd()),
      port: defaulted(number(), 8081)
    }),
    {}
  ),
  environment: defaulted(record(string(), unknown()), {}),
  stats: defaulted(
    object({
      verbose: defaulted(boolean(), false),
      builtIns: defaulted(
        union([
          object({ ignore: defaulted(array(string()), []) }),
          literal(false)
        ]),
        {}
      ),
      buffer: defaulted(boolean(), true)
    }),
    {}
  ),
  polyfills: defaulted(
    union([
      boolean(),
      object({
        assert: defaulted(boolean(), false),
        buffer: defaulted(boolean(), false),
        console: defaulted(boolean(), false),
        constants: defaulted(boolean(), false),
        crypto: defaulted(boolean(), false),
        domain: defaulted(boolean(), false),
        events: defaulted(boolean(), false),
        http: defaulted(boolean(), false),
        https: defaulted(boolean(), false),
        os: defaulted(boolean(), false),
        path: defaulted(boolean(), false),
        punycode: defaulted(boolean(), false),
        process: defaulted(boolean(), false),
        querystring: defaulted(boolean(), false),
        stream: defaulted(boolean(), false),
        /* eslint-disable @typescript-eslint/naming-convention */
        _stream_duplex: defaulted(boolean(), false),
        _stream_passthrough: defaulted(boolean(), false),
        _stream_readable: defaulted(boolean(), false),
        _stream_transform: defaulted(boolean(), false),
        _stream_writable: defaulted(boolean(), false),
        string_decoder: defaulted(boolean(), false),
        /* eslint-enable @typescript-eslint/naming-convention */
        sys: defaulted(boolean(), false),
        timers: defaulted(boolean(), false),
        tty: defaulted(boolean(), false),
        url: defaulted(boolean(), false),
        util: defaulted(boolean(), false),
        vm: defaulted(boolean(), false),
        zlib: defaulted(boolean(), false)
      })
    ]),
    false
  ),
  features: defaulted(
    object({
      images: defaulted(boolean(), true)
    }),
    {}
  ),
  customizeWebpackConfig: optional(
    SnapsWebpackCustomizeWebpackConfigFunctionStruct
  ),
  experimental: defaulted(
    object({
      wasm: defaulted(boolean(), false)
    }),
    {}
  )
});
var SnapsConfigStruct = type({
  bundler: defaulted(
    union([literal("browserify"), literal("webpack")]),
    "webpack"
  )
});
var LegacyOptionsStruct = union([
  named(
    "object with `transpilationMode` set to `localAndDeps` and `depsToTranspile` set to an array of strings",
    type({
      depsToTranspile: array(string()),
      transpilationMode: literal("localAndDeps" /* LocalAndDeps */),
      writeManifest: boolean(),
      bundlerCustomizer: optional(
        SnapsBrowserifyBundlerCustomizerFunctionStruct
      )
    })
  ),
  named(
    "object without `depsToTranspile`",
    type({
      depsToTranspile: named("empty array", empty(array())),
      transpilationMode: union([
        literal("localOnly" /* LocalOnly */),
        literal("none" /* None */)
      ]),
      writeManifest: boolean(),
      bundlerCustomizer: optional(
        SnapsBrowserifyBundlerCustomizerFunctionStruct
      )
    })
  )
]);
function getConfig(config, argv) {
  const prefix = "The snap config file is invalid";
  const suffix = dim(
    "Refer to the documentation for more information: https://docs.metamask.io/snaps/reference/cli/options/"
  );
  const { bundler } = createFromStruct(
    config,
    SnapsConfigStruct,
    prefix,
    suffix
  );
  if (bundler === "browserify") {
    const legacyConfig = createFromStruct(
      config,
      SnapsBrowserifyConfigStruct,
      prefix,
      suffix
    );
    return getWebpackConfig(mergeLegacyOptions(argv, legacyConfig));
  }
  return createFromStruct(config, SnapsWebpackConfigStruct, prefix, suffix);
}
async function loadConfig(path, argv) {
  try {
    const contents = await readFile(path, "utf8");
    const source = await transform(contents, {
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
    const config = new Module(path);
    config.paths = Module._nodeModulePaths(dirname(path));
    config._compile(source.code, path);
    if (!hasProperty(config.exports, "default")) {
      return getConfig(config.exports, argv);
    }
    return getConfig(config.exports.default, argv);
  } catch (error) {
    if (error instanceof SnapsStructError) {
      throw new ConfigError(error.message);
    }
    throw new ConfigError(
      `Unable to load snap config file at "${path}".

${indent(
        error.message
      )}`
    );
  }
}
async function resolveConfig(path, argv) {
  for (const configFile of CONFIG_FILES) {
    const filePath = resolve(path, configFile);
    if (await isFile(filePath)) {
      return await loadConfig(filePath, argv);
    }
  }
  throw new ConfigError(
    `Could not find a "snap.config.js" or "snap.config.ts" file in the current or specified directory ("${path}").`
  );
}
async function getConfigByArgv(argv, cwd = process.cwd()) {
  if (argv.config) {
    if (!await isFile(argv.config)) {
      throw new ConfigError(
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
  const defaultConfig = create(
    { bundler: "webpack" },
    SnapsWebpackConfigStruct
  );
  const path = legacyConfig.cliOptions.bundle ? dirname(legacyConfig.cliOptions.bundle) : legacyConfig.cliOptions.dist;
  const filename = legacyConfig.cliOptions.bundle ? basename(legacyConfig.cliOptions.bundle) : legacyConfig.cliOptions.outfileName;
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
      path: resolve(process.cwd(), "snap.manifest.json"),
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
    legacy: createFromStruct(
      {
        ...legacyConfig.cliOptions,
        bundlerCustomizer: legacyConfig.bundlerCustomizer
      },
      LegacyOptionsStruct,
      "Invalid Browserify CLI options"
    )
  };
}

export {
  SnapsBrowserifyConfigStruct,
  SnapsWebpackConfigStruct,
  SnapsConfigStruct,
  LegacyOptionsStruct,
  getConfig,
  loadConfig,
  resolveConfig,
  getConfigByArgv,
  mergeLegacyOptions,
  getWebpackConfig
};
//# sourceMappingURL=chunk-NR4OJOGX.mjs.map