"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkMKFQAXRFjs = require('./chunk-MKFQAXRF.js');


var _chunk7VJ2BOVUjs = require('./chunk-7VJ2BOVU.js');

// src/fs.ts
var _fs = require('fs');
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
async function isDirectory(pathString, createDir) {
  try {
    const stats = await _fs.promises.stat(pathString);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      if (!createDir) {
        return false;
      }
      await _fs.promises.mkdir(pathString, { recursive: true });
      return true;
    }
    return false;
  }
}
async function isFile(pathString) {
  try {
    const stats = await _fs.promises.stat(pathString);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}
async function readJsonFile(pathString) {
  if (!pathString.endsWith(".json")) {
    throw new Error('The specified file must be a ".json" file.');
  }
  let file;
  try {
    file = await _chunkMKFQAXRFjs.readVirtualFile.call(void 0, pathString, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        `Could not find '${pathString}'. Please ensure that the file exists.`
      );
    }
    throw error;
  }
  file.result = _chunk7VJ2BOVUjs.parseJson.call(void 0, file.toString());
  return file;
}
function getOutfilePath(outDir, outFileName) {
  return _path2.default.join(outDir, outFileName || "bundle.js");
}
function validateOutfileName(filename) {
  if (!filename.endsWith(".js") || filename === ".js" || _path2.default.basename(filename) !== filename) {
    throw new Error(`Invalid outfile name: ${filename}. Must be a .js file`);
  }
  return true;
}
async function validateFilePath(filePath) {
  const exists = await isFile(filePath);
  if (!exists) {
    throw new Error(
      `Invalid params: '${filePath}' is not a file or does not exist.`
    );
  }
  return true;
}
async function validateDirPath(dirPath, createDir) {
  const exists = await isDirectory(dirPath, createDir);
  if (!exists) {
    throw new Error(
      `Invalid params: '${dirPath}' is not a directory or could not be created.`
    );
  }
  return true;
}
async function useTemporaryFile(fileName, fileContents, fn) {
  const filePath = _path2.default.join(_os2.default.tmpdir(), fileName);
  await _fs.promises.mkdir(_path2.default.dirname(filePath), { recursive: true });
  await _fs.promises.writeFile(filePath, fileContents);
  try {
    await fn(filePath);
  } finally {
    if (await isFile(filePath)) {
      await _fs.promises.unlink(filePath);
    }
  }
}










exports.isDirectory = isDirectory; exports.isFile = isFile; exports.readJsonFile = readJsonFile; exports.getOutfilePath = getOutfilePath; exports.validateOutfileName = validateOutfileName; exports.validateFilePath = validateFilePath; exports.validateDirPath = validateDirPath; exports.useTemporaryFile = useTemporaryFile;
//# sourceMappingURL=chunk-6HXIPMBN.js.map