"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkRDBT3ZJQjs = require('./chunk-RDBT3ZJQ.js');




var _chunkEXN2TFDJjs = require('./chunk-EXN2TFDJ.js');

// src/snaps/location/local.ts
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var _http;
var LocalLocation = class {
  constructor(url, opts = {}) {
    _chunkEXN2TFDJjs.__privateAdd.call(void 0, this, _http, void 0);
    _utils.assertStruct.call(void 0, url.toString(), _snapsutils.LocalSnapIdStruct, "Invalid Snap Id");
    _utils.assert.call(void 0, 
      opts.fetchOptions === void 0,
      "Currently adding fetch options to local: is unsupported."
    );
    _chunkEXN2TFDJjs.__privateSet.call(void 0, this, _http, new (0, _chunkRDBT3ZJQjs.HttpLocation)(
      new URL(url.toString().slice(_snapsutils.SnapIdPrefixes.local.length)),
      { ...opts, fetchOptions: { cache: "no-cache" } }
    ));
  }
  async manifest() {
    const vfile = await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _http).manifest();
    return convertCanonical(vfile);
  }
  async fetch(path) {
    return convertCanonical(await _chunkEXN2TFDJjs.__privateGet.call(void 0, this, _http).fetch(path));
  }
  get shouldAlwaysReload() {
    return true;
  }
};
_http = new WeakMap();
function convertCanonical(vfile) {
  _utils.assert.call(void 0, vfile.data.canonicalPath !== void 0);
  vfile.data.canonicalPath = `local:${vfile.data.canonicalPath}`;
  return vfile;
}



exports.LocalLocation = LocalLocation;
//# sourceMappingURL=chunk-LWBPKSU2.js.map