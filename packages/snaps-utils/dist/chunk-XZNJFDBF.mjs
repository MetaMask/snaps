import {
  VirtualFile
} from "./chunk-DE22V5AO.mjs";

// src/virtual-file/toVirtualFile.ts
import { promises as fsPromises } from "fs";
async function readVirtualFile(path, encoding = null) {
  return new VirtualFile({
    path,
    value: await fsPromises.readFile(path, { encoding })
  });
}
async function writeVirtualFile(vfile, options) {
  return fsPromises.writeFile(vfile.path, vfile.value, options);
}

export {
  readVirtualFile,
  writeVirtualFile
};
//# sourceMappingURL=chunk-XZNJFDBF.mjs.map