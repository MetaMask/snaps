"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkD2ZIM5W2js = require('./chunk-D2ZIM5W2.js');


var _chunkC46KEPACjs = require('./chunk-C46KEPAC.js');


var _chunkB3NNVTA6js = require('./chunk-B3NNVTA6.js');


var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');


var _chunkS7UP2YYFjs = require('./chunk-S7UP2YYF.js');

// src/cli.ts
var _packagejson = require('@metamask/snaps-cli/package.json'); var _packagejson2 = _interopRequireDefault(_packagejson);
var _semver = require('semver'); var _semver2 = _interopRequireDefault(_semver);
var _yargs = require('yargs'); var _yargs2 = _interopRequireDefault(_yargs);
var _helpers = require('yargs/helpers');
function checkNodeVersion(nodeVersion = process.version.slice(1)) {
  const versionRange = _packagejson2.default.engines.node;
  const minimumVersion = _semver2.default.minVersion(versionRange).format();
  if (!_semver2.default.satisfies(nodeVersion, versionRange)) {
    _chunkTJ2F3J6Xjs.error.call(void 0, 
      `Node version ${nodeVersion} is not supported. Please use Node ${minimumVersion} or later.`
    );
    process.exit(1);
  }
}
async function cli(argv, commands) {
  checkNodeVersion();
  await _yargs2.default.call(void 0, _helpers.hideBin.call(void 0, argv)).scriptName("mm-snap").usage("Usage: $0 <command> [options]").example("$0 build", `Build './src/index.js' as './dist/bundle.js'`).example(
    "$0 build --config ./snap.config.build.ts",
    `Build './src/index.js' as './dist/bundle.js' using the config in './snap.config.build.ts'`
  ).example("$0 manifest --fix", `Check the snap manifest, and fix any errors`).example(
    "$0 watch --port 8000",
    `The snap input file for changes, and serve it on port 8000`
  ).example("$0 serve --port 8000", `Serve the snap bundle on port 8000`).command(commands).option("config", _chunkS7UP2YYFjs.builders_default.config).option("verboseErrors", _chunkS7UP2YYFjs.builders_default.verboseErrors).option("suppressWarnings", _chunkS7UP2YYFjs.builders_default.suppressWarnings).strict().middleware(async (args) => {
    args.context = {
      config: await _chunkD2ZIM5W2js.getConfigByArgv.call(void 0, args)
    };
    _chunkC46KEPACjs.sanitizeInputs.call(void 0, args);
  }, false).demandCommand(1, "You must specify at least one command.").fail((message, failure) => {
    _chunkTJ2F3J6Xjs.error.call(void 0, _chunkB3NNVTA6js.getYargsErrorMessage.call(void 0, message, failure));
    process.exit(1);
  }).help().alias("help", "h").parseAsync();
}




exports.checkNodeVersion = checkNodeVersion; exports.cli = cli;
//# sourceMappingURL=chunk-ZVUF6JDJ.js.map