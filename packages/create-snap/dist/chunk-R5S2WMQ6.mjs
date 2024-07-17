import {
  SNAP_LOCATION,
  buildSnap,
  cloneTemplate,
  gitInitWithCommit,
  isGitInstalled,
  isInGitRepository,
  prepareWorkingDirectory,
  yarnInstall
} from "./chunk-QZNWE6ZB.mjs";

// src/cmds/init/initHandler.ts
import cliPackageJson from "@metamask/create-snap/package.json";
import {
  NpmSnapFileNames,
  readJsonFile,
  createSnapManifest,
  logInfo
} from "@metamask/snaps-utils/node";
import { promises as fs } from "fs";
import pathUtils from "path";
import semver from "semver";
async function initHandler(argv) {
  const { directory } = argv;
  const versionRange = cliPackageJson.engines.node;
  const minimumVersion = semver.minVersion(versionRange).format();
  const isVersionSupported = semver.satisfies(process.version, versionRange);
  if (!isVersionSupported) {
    throw new Error(
      `Init Error: You are using an outdated version of Node (${process.version}). Please update to Node ${minimumVersion} or later.`
    );
  }
  const gitExists = isGitInstalled();
  if (!gitExists) {
    throw new Error(
      `Init Error: git is not installed. Please install git to continue.`
    );
  }
  const directoryToUse = directory ? pathUtils.resolve(process.cwd(), directory) : process.cwd();
  logInfo(`Preparing ${directoryToUse}...`);
  await prepareWorkingDirectory(directoryToUse);
  try {
    logInfo(`Cloning template...`);
    cloneTemplate(directoryToUse);
    await fs.rm(pathUtils.join(directoryToUse, ".git"), {
      force: true,
      recursive: true
    });
  } catch (error) {
    throw new Error("Init Error: Failed to create template.");
  }
  logInfo("Installing dependencies...");
  yarnInstall(directoryToUse);
  if (!isInGitRepository(directoryToUse)) {
    logInfo("Initializing git repository...");
    gitInitWithCommit(directoryToUse);
  }
  const snapLocation = pathUtils.join(directoryToUse, SNAP_LOCATION);
  logInfo("Running initial build...");
  buildSnap(snapLocation);
  const manifest = (await readJsonFile(pathUtils.join(snapLocation, NpmSnapFileNames.Manifest))).result;
  const validatedManifest = createSnapManifest(manifest);
  const packageJson = (await readJsonFile(
    pathUtils.join(snapLocation, NpmSnapFileNames.PackageJson)
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

export {
  initHandler
};
//# sourceMappingURL=chunk-R5S2WMQ6.mjs.map