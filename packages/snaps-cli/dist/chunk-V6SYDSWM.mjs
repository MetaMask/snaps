import {
  getFunctionLoader
} from "./chunk-AZMQTZXZ.mjs";
import {
  processDependencies
} from "./chunk-QMD3VO6R.mjs";
import {
  __require
} from "./chunk-R77RJHC5.mjs";

// src/webpack/utils.ts
import { bytesToBase64 } from "@metamask/utils";
import { dim } from "chalk";
import { promises as fs } from "fs";
import { builtinModules } from "module";
import { dirname, resolve } from "path";
import stripAnsi from "strip-ansi";

// src/webpack/loaders/browserify.ts
import browserify from "browserify";
import { Readable } from "readable-stream";
var loader = async function(content, sourceMap) {
  const config = this.getOptions();
  const { transpilationMode } = config;
  const bundler = browserify({
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    debug: Boolean(sourceMap),
    standalone: "<snap>"
  });
  if (transpilationMode !== "none" /* None */) {
    const babelifyOptions = processDependencies(config);
    bundler.transform(__require("babelify"), {
      global: transpilationMode === "localAndDeps" /* LocalAndDeps */,
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      presets: [
        __require("@babel/preset-typescript"),
        [
          __require("@babel/preset-env"),
          {
            targets: {
              browsers: await getBrowserslistTargets()
            }
          }
        ]
      ],
      plugins: [
        __require("@babel/plugin-transform-runtime"),
        __require("@babel/plugin-transform-class-properties"),
        __require("@babel/plugin-transform-private-methods"),
        __require("@babel/plugin-transform-class-static-block"),
        __require("@babel/plugin-transform-private-property-in-object")
      ],
      ...babelifyOptions
    });
  }
  config.bundlerCustomizer?.(bundler);
  const stream = new Readable();
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
var BROWSERSLIST_FILE = resolve(
  dirname(
    // eslint-disable-next-line n/no-extraneous-require
    __require.resolve("@metamask/snaps-cli/package.json")
  ),
  ".browserslistrc"
);
var WEBPACK_FALLBACKS = {
  assert: __require.resolve("assert/"),
  buffer: __require.resolve("buffer/"),
  console: __require.resolve("console-browserify"),
  constants: __require.resolve("constants-browserify"),
  crypto: __require.resolve("crypto-browserify"),
  domain: __require.resolve("domain-browser"),
  events: __require.resolve("events/"),
  http: __require.resolve("stream-http"),
  https: __require.resolve("https-browserify"),
  os: __require.resolve("os-browserify/browser"),
  path: __require.resolve("path-browserify"),
  punycode: __require.resolve("punycode/"),
  process: __require.resolve("process/browser"),
  querystring: __require.resolve("querystring-es3"),
  stream: __require.resolve("stream-browserify"),
  /* eslint-disable @typescript-eslint/naming-convention  */
  _stream_duplex: __require.resolve("readable-stream/lib/_stream_duplex"),
  _stream_passthrough: __require.resolve(
    "readable-stream/lib/_stream_passthrough"
  ),
  _stream_readable: __require.resolve("readable-stream/lib/_stream_readable"),
  _stream_transform: __require.resolve("readable-stream/lib/_stream_transform"),
  _stream_writable: __require.resolve("readable-stream/lib/_stream_writable"),
  string_decoder: __require.resolve("string_decoder/"),
  /* eslint-enable @typescript-eslint/naming-convention  */
  sys: __require.resolve("util/"),
  timers: __require.resolve("timers-browserify"),
  tty: __require.resolve("tty-browserify"),
  url: __require.resolve("url/"),
  util: __require.resolve("util/"),
  vm: __require.resolve("vm-browserify"),
  zlib: __require.resolve("browserify-zlib")
};
async function getDefaultLoader({
  legacy,
  sourceMap
}) {
  if (legacy) {
    return getFunctionLoader(browserify_default, legacy);
  }
  const targets = await getBrowserslistTargets();
  return {
    /**
     * We use the `swc-loader` to transpile TypeScript and JavaScript files.
     * This is a Webpack loader that uses the `SWC` compiler, which is a much
     * faster alternative to Babel and TypeScript's own compiler.
     */
    loader: __require.resolve("swc-loader"),
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
      spinner.text = `${spinnerText} ${dim(
        `(${Math.round(percentage * 100)}%)`
      )}`;
    }
  };
}
async function getBrowserslistTargets() {
  const contents = await fs.readFile(BROWSERSLIST_FILE, "utf8");
  return contents.split("\n").map((line) => line.trim()).filter((line) => line && !line.startsWith("#"));
}
function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
function getFallbacks(polyfills) {
  if (polyfills === true) {
    return Object.fromEntries(
      builtinModules.map((name) => [
        name,
        WEBPACK_FALLBACKS[name] ?? false
      ])
    );
  }
  if (polyfills === false) {
    return Object.fromEntries(builtinModules.map((name) => [name, false]));
  }
  return Object.fromEntries(
    builtinModules.map((name) => [
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
      const visibleWord = stripAnsi(word);
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
  const dataUrl = `data:${mimeType};base64,${bytesToBase64(bytes)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg"><image href="${dataUrl}" /></svg>`;
}

export {
  BROWSERSLIST_FILE,
  WEBPACK_FALLBACKS,
  getDefaultLoader,
  getDevTool,
  getProgressHandler,
  getBrowserslistTargets,
  pluralize,
  getFallbacks,
  getEnvironmentVariables,
  formatText,
  getImageSVG,
  browserify_default
};
//# sourceMappingURL=chunk-V6SYDSWM.mjs.map