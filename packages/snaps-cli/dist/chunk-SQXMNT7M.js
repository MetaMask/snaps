"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkQHCKVO3Pjs = require('./chunk-QHCKVO3P.js');


var _chunkPDYQXXLPjs = require('./chunk-PDYQXXLP.js');


var _chunkX3D3MHWFjs = require('./chunk-X3D3MHWF.js');

// src/webpack/utils.ts
var _utils = require('@metamask/utils');
var _chalk = require('chalk');
var _fs = require('fs');
var _module = require('module');
var _path = require('path');
var _stripansi = require('strip-ansi'); var _stripansi2 = _interopRequireDefault(_stripansi);

// src/webpack/loaders/browserify.ts
var _browserify = require('browserify'); var _browserify2 = _interopRequireDefault(_browserify);
var _readablestream = require('readable-stream');
var loader = async function(content, sourceMap) {
  const config = this.getOptions();
  const { transpilationMode } = config;
  const bundler = _browserify2.default.call(void 0, {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    debug: Boolean(sourceMap),
    standalone: "<snap>"
  });
  if (transpilationMode !== "none" /* None */) {
    const babelifyOptions = _chunkPDYQXXLPjs.processDependencies.call(void 0, config);
    bundler.transform(_chunkX3D3MHWFjs.__require.call(void 0, "babelify"), {
      global: transpilationMode === "localAndDeps" /* LocalAndDeps */,
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      presets: [
        _chunkX3D3MHWFjs.__require.call(void 0, "@babel/preset-typescript"),
        [
          _chunkX3D3MHWFjs.__require.call(void 0, "@babel/preset-env"),
          {
            targets: {
              browsers: await getBrowserslistTargets()
            }
          }
        ]
      ],
      plugins: [
        _chunkX3D3MHWFjs.__require.call(void 0, "@babel/plugin-transform-runtime"),
        _chunkX3D3MHWFjs.__require.call(void 0, "@babel/plugin-transform-class-properties"),
        _chunkX3D3MHWFjs.__require.call(void 0, "@babel/plugin-transform-private-methods"),
        _chunkX3D3MHWFjs.__require.call(void 0, "@babel/plugin-transform-class-static-block"),
        _chunkX3D3MHWFjs.__require.call(void 0, "@babel/plugin-transform-private-property-in-object")
      ],
      ...babelifyOptions
    });
  }
  config.bundlerCustomizer?.(bundler);
  const stream = new (0, _readablestream.Readable)();
  stream.push(content);
  stream.push(null);
  bundler.add(stream, {
    file: this.resourcePath
  });
  return new Promise((resolve2, reject) => {
    bundler.bundle((bundleError, buffer) => {
      if (bundleError) {
        reject(bundleError);
        return;
      }
      resolve2(buffer);
    });
  });
};
var browserify_default = loader;

// src/webpack/utils.ts
var BROWSERSLIST_FILE = _path.resolve.call(void 0, 
  _path.dirname.call(void 0, 
    // eslint-disable-next-line n/no-extraneous-require
    _chunkX3D3MHWFjs.__require.resolve("@metamask/snaps-cli/package.json")
  ),
  ".browserslistrc"
);
var WEBPACK_FALLBACKS = {
  assert: _chunkX3D3MHWFjs.__require.resolve("assert/"),
  buffer: _chunkX3D3MHWFjs.__require.resolve("buffer/"),
  console: _chunkX3D3MHWFjs.__require.resolve("console-browserify"),
  constants: _chunkX3D3MHWFjs.__require.resolve("constants-browserify"),
  crypto: _chunkX3D3MHWFjs.__require.resolve("crypto-browserify"),
  domain: _chunkX3D3MHWFjs.__require.resolve("domain-browser"),
  events: _chunkX3D3MHWFjs.__require.resolve("events/"),
  http: _chunkX3D3MHWFjs.__require.resolve("stream-http"),
  https: _chunkX3D3MHWFjs.__require.resolve("https-browserify"),
  os: _chunkX3D3MHWFjs.__require.resolve("os-browserify/browser"),
  path: _chunkX3D3MHWFjs.__require.resolve("path-browserify"),
  punycode: _chunkX3D3MHWFjs.__require.resolve("punycode/"),
  process: _chunkX3D3MHWFjs.__require.resolve("process/browser"),
  querystring: _chunkX3D3MHWFjs.__require.resolve("querystring-es3"),
  stream: _chunkX3D3MHWFjs.__require.resolve("stream-browserify"),
  /* eslint-disable @typescript-eslint/naming-convention  */
  _stream_duplex: _chunkX3D3MHWFjs.__require.resolve("readable-stream/lib/_stream_duplex"),
  _stream_passthrough: _chunkX3D3MHWFjs.__require.resolve(
    "readable-stream/lib/_stream_passthrough"
  ),
  _stream_readable: _chunkX3D3MHWFjs.__require.resolve("readable-stream/lib/_stream_readable"),
  _stream_transform: _chunkX3D3MHWFjs.__require.resolve("readable-stream/lib/_stream_transform"),
  _stream_writable: _chunkX3D3MHWFjs.__require.resolve("readable-stream/lib/_stream_writable"),
  string_decoder: _chunkX3D3MHWFjs.__require.resolve("string_decoder/"),
  /* eslint-enable @typescript-eslint/naming-convention  */
  sys: _chunkX3D3MHWFjs.__require.resolve("util/"),
  timers: _chunkX3D3MHWFjs.__require.resolve("timers-browserify"),
  tty: _chunkX3D3MHWFjs.__require.resolve("tty-browserify"),
  url: _chunkX3D3MHWFjs.__require.resolve("url/"),
  util: _chunkX3D3MHWFjs.__require.resolve("util/"),
  vm: _chunkX3D3MHWFjs.__require.resolve("vm-browserify"),
  zlib: _chunkX3D3MHWFjs.__require.resolve("browserify-zlib")
};
async function getDefaultLoader({
  legacy,
  sourceMap
}) {
  if (legacy) {
    return _chunkQHCKVO3Pjs.getFunctionLoader.call(void 0, browserify_default, legacy);
  }
  const targets = await getBrowserslistTargets();
  return {
    /**
     * We use the `swc-loader` to transpile TypeScript and JavaScript files.
     * This is a Webpack loader that uses the `SWC` compiler, which is a much
     * faster alternative to Babel and TypeScript's own compiler.
     */
    loader: _chunkX3D3MHWFjs.__require.resolve("swc-loader"),
    /**
     * The options for the `swc-loader`. These can be overridden in the
     * `.swcrc` file.
     *
     * @see https://swc.rs/docs/configuration/swcrc
     */
    options: {
      sync: false,
      /**
       * This tells SWC to generate source maps. We set it to the
       * `sourceMap` value from the config object.
       *
       * This must be enabled if source maps are enabled in the config.
       */
      sourceMaps: Boolean(getDevTool(sourceMap)),
      jsc: {
        parser: {
          /**
           * This tells the parser to parse TypeScript files. If you
           * don't need to support TypeScript, you can set this to
           * `ecmascript` instead, but there's no harm in leaving it
           * as `typescript`.
           *
           * @see https://swc.rs/docs/configuration/compilation#jscparser
           */
          syntax: "typescript",
          /**
           * This tells the parser to transpile JSX.
           *
           * @see https://swc.rs/docs/configuration/compilation#jscparser
           * @see https://swc.rs/docs/configuration/compilation#jscparserjsx
           */
          tsx: true
        },
        transform: {
          react: {
            /**
             * This tells SWC to use the JSX runtime, instead of the
             * `createElement` function.
             *
             * @see https://swc.rs/docs/configuration/compilation#jsctransformreact
             */
            runtime: "automatic",
            /**
             * This tells SWC to import the JSX runtime from the
             * `@metamask/snaps-sdk` package, instead of the default React
             * package.
             *
             * @see https://swc.rs/docs/configuration/compilation#jsctransformreact
             */
            importSource: "@metamask/snaps-sdk",
            /**
             * This tells SWC to use `Object.assign` and `Object.create` for
             * JSX spread attributes, instead of the default behavior.
             *
             * @see https://swc.rs/docs/configuration/compilation#jsctransformreact
             */
            useBuiltins: true
          }
        }
      },
      /**
       * The module configuration. This tells SWC how to output the
       * transpiled code.
       *
       * @see https://swc.rs/docs/configuration/modules
       */
      module: {
        /**
         * This tells SWC to output ES6 modules. This will allow Webpack to
         * optimize the output code better. Snaps don't support ES6 however, so
         * the output code will be transpiled to CommonJS by Webpack later in
         * the build process.
         *
         * @see https://swc.rs/docs/configuration/modules#es6
         */
        type: "es6"
      },
      env: {
        targets: targets.join(", ")
      }
    }
  };
}
function getDevTool(sourceMap) {
  if (sourceMap === "inline") {
    return "inline-source-map";
  }
  if (sourceMap === true) {
    return "source-map";
  }
  return false;
}
function getProgressHandler(spinner, spinnerText) {
  return (percentage) => {
    if (spinner && spinnerText) {
      spinner.text = `${spinnerText} ${_chalk.dim.call(void 0, 
        `(${Math.round(percentage * 100)}%)`
      )}`;
    }
  };
}
async function getBrowserslistTargets() {
  const contents = await _fs.promises.readFile(BROWSERSLIST_FILE, "utf8");
  return contents.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
}
function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
function getFallbacks(polyfills) {
  if (polyfills === true) {
    return Object.fromEntries(
      _module.builtinModules.map((name) => [
        name,
        WEBPACK_FALLBACKS[name] ?? false
      ])
    );
  }
  if (polyfills === false) {
    return Object.fromEntries(_module.builtinModules.map((name) => [name, false]));
  }
  return Object.fromEntries(
    _module.builtinModules.map((name) => [
      name,
      polyfills[name] ? WEBPACK_FALLBACKS[name] : false
    ])
  );
}
function getEnvironmentVariables(environment, defaults = {
  NODE_DEBUG: "false",
  NODE_ENV: "production",
  DEBUG: "false"
}) {
  return Object.fromEntries(
    Object.entries({
      ...defaults,
      ...environment
    }).map(([key, value]) => [`process.env.${key}`, JSON.stringify(value)])
  );
}
function formatLine(line, indent, initialIndent) {
  const terminalWidth = process.stdout.columns;
  if (!terminalWidth) {
    return `${" ".repeat(initialIndent)}${line}`;
  }
  return line.split(" ").reduce(
    ({ formattedText, currentLineLength }, word, index) => {
      const visibleWord = _stripansi2.default.call(void 0, word);
      const spaceBeforeWord = index > 0 ? " " : "";
      const wordLengthWithSpace = visibleWord.length + spaceBeforeWord.length;
      if (currentLineLength + wordLengthWithSpace > terminalWidth) {
        return {
          formattedText: `${formattedText}
${" ".repeat(indent)}${word}`,
          currentLineLength: indent + visibleWord.length
        };
      }
      return {
        formattedText: formattedText + spaceBeforeWord + word,
        currentLineLength: currentLineLength + wordLengthWithSpace
      };
    },
    {
      formattedText: " ".repeat(initialIndent),
      currentLineLength: initialIndent
    }
  ).formattedText;
}
function formatText(text, indent, initialIndent = indent) {
  const lines = text.split("\n");
  return lines.map((line, index) => {
    const lineIndent = index === 0 ? initialIndent : indent;
    return formatLine(line, indent, lineIndent);
  }).join("\n");
}
function getImageSVG(mimeType, bytes) {
  const dataUrl = `data:${mimeType};base64,${_utils.bytesToBase64.call(void 0, bytes)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg"><image href="${dataUrl}" /></svg>`;
}














exports.BROWSERSLIST_FILE = BROWSERSLIST_FILE; exports.WEBPACK_FALLBACKS = WEBPACK_FALLBACKS; exports.getDefaultLoader = getDefaultLoader; exports.getDevTool = getDevTool; exports.getProgressHandler = getProgressHandler; exports.getBrowserslistTargets = getBrowserslistTargets; exports.pluralize = pluralize; exports.getFallbacks = getFallbacks; exports.getEnvironmentVariables = getEnvironmentVariables; exports.formatText = formatText; exports.getImageSVG = getImageSVG; exports.browserify_default = browserify_default;
//# sourceMappingURL=chunk-SQXMNT7M.js.map