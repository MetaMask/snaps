"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }








var _chunkSWJDZJPMjs = require('./chunk-SWJDZJPM.js');

// src/cmds/init/initHandler.ts
var _packagejson = require('@metamask/create-snap/package.json'); var _packagejson2 = _interopRequireDefault(_packagejson);





var _node = require('@metamask/snaps-utils/node');
var _fs = require('fs');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _semver = require('semver'); var _semver2 = _interopRequireDefault(_semver);
async function initHandler(argv) {
  const { directory } = argv;
  const versionRange = _packagejson2.default.engines.node;
  const minimumVersion = _semver2.default.minVersion(versionRange).format();
  const isVersionSupported = _semver2.default.satisfies(process.version, versionRange);
  if (!isVersionSupported) {
    throw new Error(
      `Init Error: You are using an outdated version of Node (${process.version}). Please update to Node ${minimumVersion} or later.`
    );
  }
  const gitExists = _chunkSWJDZJPMjs.isGitInstalled.call(void 0, );
  if (!gitExists) {
    throw new Error(
      `Init Error: git is not installed. Please install git to continue.`
    );
  }
  const directoryToUse = directory ? _path2.default.resolve(process.cwd(), directory) : process.cwd();
  _node.logInfo.call(void 0, `Preparing ${directoryToUse}...`);
  await _chunkSWJDZJPMjs.prepareWorkingDirectory.call(void 0, directoryToUse);
  try {
    _node.logInfo.call(void 0, `Cloning template...`);
    _chunkSWJDZJPMjs.cloneTemplate.call(void 0, directoryToUse);
    await _fs.promises.rm(_path2.default.join(directoryToUse, ".git"), {
      force: true,
      recursive: true
    });
  } catch (error) {
    throw new Error("Init Error: Failed to create template.");
  }
  _node.logInfo.call(void 0, "Installing dependencies...");
  _chunkSWJDZJPMjs.yarnInstall.call(void 0, directoryToUse);
  if (!_chunkSWJDZJPMjs.isInGitRepository.call(void 0, directoryToUse)) {
    _node.logInfo.call(void 0, "Initializing git repository...");
    _chunkSWJDZJPMjs.gitInitWithCommit.call(void 0, directoryToUse);
  }
  const snapLocation = _path2.default.join(directoryToUse, _chunkSWJDZJPMjs.SNAP_LOCATION);
  _node.logInfo.call(void 0, "Running initial build...");
  _chunkSWJDZJPMjs.buildSnap.call(void 0, snapLocation);
  const manifest = (await _node.readJsonFile.call(void 0, _path2.default.join(snapLocation, _node.NpmSnapFileNames.Manifest))).result;
  const validatedManifest = _node.createSnapManifest.call(void 0, manifest);
  const packageJson = (await _node.readJsonFile.call(void 0, 
    _path2.default.join(snapLocation, _node.NpmSnapFileNames.PackageJson)
  )).result;
  const distPath = validatedManifest.source.location.npm.filePath.split("/");
  return {
    ...argv,
    dist: distPath[0],
    outfileName: distPath[1],
    src: packageJson.main || "src/index.js",
    snapLocation
  };
}



exports.initHandler = initHandler;
//# sourceMappingURL=chunk-DBZ5JHUB.js.map