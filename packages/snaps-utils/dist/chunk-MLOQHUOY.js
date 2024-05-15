"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk473MIETWjs = require('./chunk-473MIETW.js');

// src/checksum.ts
var _utils = require('@metamask/utils');
var _sha256 = require('@noble/hashes/sha256');
async function checksum(bytes) {
  const value = _chunk473MIETWjs.getBytes.call(void 0, bytes);
  if ("crypto" in globalThis && typeof globalThis.crypto === "object" && crypto.subtle?.digest) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", value));
  }
  return _sha256.sha256.call(void 0, value);
}
async function checksumFiles(files) {
  const checksums = await Promise.all(
    [...files].sort((a, b) => {
      _utils.assert.call(void 0, a.path !== b.path, "Tried to sort files with non-unique paths.");
      if (a.path < b.path) {
        return -1;
      }
      return 1;
    }).map(async (file) => checksum(file))
  );
  return checksum(_utils.concatBytes.call(void 0, checksums));
}




exports.checksum = checksum; exports.checksumFiles = checksumFiles;
//# sourceMappingURL=chunk-MLOQHUOY.js.map