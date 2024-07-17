"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkV6WATWTVjs = require('./chunk-V6WATWTV.js');


var _chunkDBZ5JHUBjs = require('./chunk-DBZ5JHUB.js');

// src/cmds/init/index.ts
var _snapsutils = require('@metamask/snaps-utils');
var initCommand = {
  command: ["$0 [directory]"],
  desc: "Initialize MetaMask Snaps project",
  builder: (yarg) => {
    yarg.positional("directory", _chunkV6WATWTVjs.builders_default.directory);
    return yarg;
  },
  handler: init
};
async function init(argv) {
  await _chunkDBZ5JHUBjs.initHandler.call(void 0, argv);
  _snapsutils.logInfo.call(void 0, "\nSnap project successfully initiated!");
}



exports.initCommand = initCommand;
//# sourceMappingURL=chunk-UUYJFOOU.js.map