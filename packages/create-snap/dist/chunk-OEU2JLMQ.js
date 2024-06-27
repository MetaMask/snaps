"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkUUYJFOOUjs = require('./chunk-UUYJFOOU.js');


var _chunkV6WATWTVjs = require('./chunk-V6WATWTV.js');

// src/cli.ts
var _yargs = require('yargs'); var _yargs2 = _interopRequireDefault(_yargs);
var _helpers = require('yargs/helpers');
async function cli(argv, initCommand2 = _chunkUUYJFOOUjs.initCommand) {
  await _yargs2.default.call(void 0, _helpers.hideBin.call(void 0, argv)).scriptName("create-snap").usage("Usage: $0 [directory-name]").example(
    "$0 my-new-snap",
    `	Initialize a snap project in the 'my-new-snap' directory`
  ).command(initCommand2).option("verboseErrors", _chunkV6WATWTVjs.builders_default.verboseErrors).strict().help().alias("help", "h").parseAsync();
}



exports.cli = cli;
//# sourceMappingURL=chunk-OEU2JLMQ.js.map