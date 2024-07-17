"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/internals/simulation/files.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var _promises = require('fs/promises');
var _mime = require('mime'); var _mime2 = _interopRequireDefault(_mime);
var _path = require('path');
async function getSnapFile(files, path, encoding = _snapssdk.AuxiliaryFileEncoding.Base64) {
  const normalizedPath = _snapsutils.normalizeRelative.call(void 0, path);
  const base64 = files.find((file) => file.path === normalizedPath)?.toString("base64");
  if (!base64) {
    return null;
  }
  return await _snapsutils.encodeAuxiliaryFile.call(void 0, base64, encoding);
}
function getContentType(extension) {
  return _mime2.default.getType(extension) ?? "application/octet-stream";
}
async function getFileSize(file) {
  if (typeof file === "string") {
    const { size } = await _promises.stat.call(void 0, _path.resolve.call(void 0, process.cwd(), file));
    return size;
  }
  return file.length;
}
async function getFileToUpload(file, { fileName, contentType } = {}) {
  if (typeof file === "string") {
    const buffer = await _promises.readFile.call(void 0, _path.resolve.call(void 0, process.cwd(), file));
    return {
      name: fileName ?? _path.basename.call(void 0, file),
      size: buffer.byteLength,
      contentType: contentType ?? getContentType(_path.extname.call(void 0, file)),
      contents: _utils.bytesToBase64.call(void 0, buffer)
    };
  }
  return {
    name: fileName ?? "",
    size: file.length,
    contentType: contentType ?? "application/octet-stream",
    contents: _utils.bytesToBase64.call(void 0, file)
  };
}






exports.getSnapFile = getSnapFile; exports.getContentType = getContentType; exports.getFileSize = getFileSize; exports.getFileToUpload = getFileToUpload;
//# sourceMappingURL=chunk-SW65QYFV.js.map