"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/cmds/init/initUtils.ts
var _child_process = require('child_process');
var _fs = require('fs');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var TEMPLATE_GIT_URL = "https://github.com/MetaMask/template-snap-monorepo.git";
var SNAP_LOCATION = "packages/snap/";
async function prepareWorkingDirectory(directory) {
  try {
    const isCurrentDirectory = directory === process.cwd();
    if (!isCurrentDirectory) {
      try {
        await _fs.promises.mkdir(directory, { recursive: true });
      } catch (error) {
        throw new Error("Init Error: Failed to create new directory.");
      }
    }
    const existingFiles = await _fs.promises.readdir(directory);
    if (existingFiles.length > 0) {
      throw new Error(`Directory ${directory} not empty.`);
    }
  } catch (error) {
    throw new Error(
      `Init Error: Failed to prepare working directory with message: ${error.message}`
    );
  }
}
function cloneTemplate(directory) {
  const result = _child_process.spawnSync.call(void 0, 
    "git",
    ["clone", "--depth=1", TEMPLATE_GIT_URL, directory],
    {
      stdio: [2]
    }
  );
  if (result.error || result.status !== 0) {
    throw new Error("Init Error: Failed to clone the template.");
  }
}
function isGitInstalled() {
  const result = _child_process.spawnSync.call(void 0, "git", ["--version"], { stdio: "ignore" });
  return result.status === 0;
}
function isInGitRepository(directory) {
  const result = _child_process.spawnSync.call(void 0, "git", ["rev-parse", "--is-inside-work-tree"], {
    stdio: "ignore",
    cwd: _path2.default.resolve(__dirname, directory)
  });
  return result.status === 0;
}
function gitInitWithCommit(directory) {
  const commands = [
    {
      cmd: "git",
      params: ["init"]
    },
    {
      cmd: "git",
      params: ["add", "."]
    },
    {
      cmd: "git",
      params: ["commit", "-m", "Initial commit from @metamask/create-snap"]
    }
  ];
  for (const command of commands) {
    const result = _child_process.spawnSync.call(void 0, command.cmd, command.params, {
      stdio: "ignore",
      cwd: _path2.default.resolve(__dirname, directory)
    });
    if (result.error || result.status !== 0) {
      throw new Error("Init Error: Failed to init a new git repository.");
    }
  }
}
function yarnInstall(directory) {
  const result = _child_process.spawnSync.call(void 0, "yarn", ["install"], {
    stdio: [0, 1, 2],
    cwd: directory
  });
  if (result.error || result.status !== 0) {
    throw new Error("Init Error: Failed to install dependencies.");
  }
}
function buildSnap(snapDirectory) {
  const result = _child_process.spawnSync.call(void 0, "yarn", ["build"], {
    stdio: [0, 1, 2],
    cwd: _path2.default.resolve(__dirname, snapDirectory)
  });
  if (result.error || result.status !== 0) {
    throw new Error("Init Error: Failed to build snap.");
  }
}











exports.TEMPLATE_GIT_URL = TEMPLATE_GIT_URL; exports.SNAP_LOCATION = SNAP_LOCATION; exports.prepareWorkingDirectory = prepareWorkingDirectory; exports.cloneTemplate = cloneTemplate; exports.isGitInstalled = isGitInstalled; exports.isInGitRepository = isInGitRepository; exports.gitInitWithCommit = gitInitWithCommit; exports.yarnInstall = yarnInstall; exports.buildSnap = buildSnap;
//# sourceMappingURL=chunk-SWJDZJPM.js.map