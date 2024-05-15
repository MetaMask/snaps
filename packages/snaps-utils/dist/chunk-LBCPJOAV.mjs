import {
  readVirtualFile
} from "./chunk-IGMAXVPP.mjs";
import {
  parseJson
} from "./chunk-UNNEBOL4.mjs";

// src/fs.ts
import { promises as fs } from "fs";
import os from "os";
import pathUtils from "path";
async function isDirectory(pathString, createDir) {
  try {
    const stats = await fs.stat(pathString);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === "ENOENT") {
      if (!createDir) {
        return false;
      }
      await fs.mkdir(pathString, { recursive: true });
      return true;
    }
    return false;
  }
}
async function isFile(pathString) {
  try {
    const stats = await fs.stat(pathString);
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
    file = await readVirtualFile(pathString, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new Error(
        `Could not find '${pathString}'. Please ensure that the file exists.`
      );
    }
    throw error;
  }
  file.result = parseJson(file.toString());
  return file;
}
function getOutfilePath(outDir, outFileName) {
  return pathUtils.join(outDir, outFileName || "bundle.js");
}
function validateOutfileName(filename) {
  if (!filename.endsWith(".js") || filename === ".js" || pathUtils.basename(filename) !== filename) {
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
  const filePath = pathUtils.join(os.tmpdir(), fileName);
  await fs.mkdir(pathUtils.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileContents);
  try {
    await fn(filePath);
  } finally {
    if (await isFile(filePath)) {
      await fs.unlink(filePath);
    }
  }
}

export {
  isDirectory,
  isFile,
  readJsonFile,
  getOutfilePath,
  validateOutfileName,
  validateFilePath,
  validateDirPath,
  useTemporaryFile
};
//# sourceMappingURL=chunk-LBCPJOAV.mjs.map