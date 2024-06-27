// src/utils/path.ts
import { relative } from "path";
function getRelativePath(absolutePath, cwd = process.cwd()) {
  return relative(cwd, absolutePath);
}

export {
  getRelativePath
};
//# sourceMappingURL=chunk-TDSL55B3.mjs.map