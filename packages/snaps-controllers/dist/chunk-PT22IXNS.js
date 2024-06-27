"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkLWBPKSU2js = require('./chunk-LWBPKSU2.js');


var _chunkXWDEGRM5js = require('./chunk-XWDEGRM5.js');


var _chunkRDBT3ZJQjs = require('./chunk-RDBT3ZJQ.js');

// src/snaps/location/location.ts
var _utils = require('@metamask/utils');
function detectSnapLocation(location, opts) {
  const allowHttp = opts?.allowHttp ?? false;
  const allowLocal = opts?.allowLocal ?? false;
  const root = new URL(location);
  switch (root.protocol) {
    case "npm:":
      return new (0, _chunkXWDEGRM5js.NpmLocation)(root, opts);
    case "local:":
      _utils.assert.call(void 0, allowLocal, new TypeError("Fetching local snaps is disabled."));
      return new (0, _chunkLWBPKSU2js.LocalLocation)(root, opts);
    case "http:":
    case "https:":
      _utils.assert.call(void 0, 
        allowHttp,
        new TypeError("Fetching snaps through http/https is disabled.")
      );
      return new (0, _chunkRDBT3ZJQjs.HttpLocation)(root, opts);
    default:
      throw new TypeError(
        `Unrecognized "${root.protocol}" snap location protocol.`
      );
  }
}



exports.detectSnapLocation = detectSnapLocation;
//# sourceMappingURL=chunk-PT22IXNS.js.map