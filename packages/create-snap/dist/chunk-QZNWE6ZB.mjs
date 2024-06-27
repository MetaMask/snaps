import { fileURLToPath } from 'url'
import path from 'path'

const getFilename = () => fileURLToPath(import.meta.url)
const getDirname = () => path.dirname(getFilename())

export const __dirname = /* @__PURE__ */ getDirname()
// src/cmds/init/initUtils.ts
import { spawnSync } from "child_process";
import { promises as fs } from "fs";
import pathUtils from "path";
var TEMPLATE_GIT_URL = "https://github.com/MetaMask/template-snap-monorepo.git";
var SNAP_LOCATION = "packages/snap/";
async function prepareWorkingDirectory(directory) {
  try {
    const isCurrentDirectory = directory === process.cwd();
    if (!isCurrentDirectory) {
      try {
        await fs.mkdir(directory, { recursive: true });
      } catch (error) {
        throw new Error("Init Error: Failed to create new directory.");
      }
    }
    const existingFiles = await fs.readdir(directory);
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
  const result = spawnSync(
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
  const result = spawnSync("git", ["--version"], { stdio: "ignore" });
  return result.status === 0;
}
function isInGitRepository(directory) {
  const result = spawnSync("git", ["rev-parse", "--is-inside-work-tree"], {
    stdio: "ignore",
    cwd: pathUtils.resolve(__dirname, directory)
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
    const result = spawnSync(command.cmd, command.params, {
      stdio: "ignore",
      cwd: pathUtils.resolve(__dirname, directory)
    });
    if (result.error || result.status !== 0) {
      throw new Error("Init Error: Failed to init a new git repository.");
    }
  }
}
function yarnInstall(directory) {
  const result = spawnSync("yarn", ["install"], {
    stdio: [0, 1, 2],
    cwd: directory
  });
  if (result.error || result.status !== 0) {
    throw new Error("Init Error: Failed to install dependencies.");
  }
}
function buildSnap(snapDirectory) {
  const result = spawnSync("yarn", ["build"], {
    stdio: [0, 1, 2],
    cwd: pathUtils.resolve(__dirname, snapDirectory)
  });
  if (result.error || result.status !== 0) {
    throw new Error("Init Error: Failed to build snap.");
  }
}

export {
  TEMPLATE_GIT_URL,
  SNAP_LOCATION,
  prepareWorkingDirectory,
  cloneTemplate,
  isGitInstalled,
  isInGitRepository,
  gitInitWithCommit,
  yarnInstall,
  buildSnap
};
//# sourceMappingURL=chunk-QZNWE6ZB.mjs.map