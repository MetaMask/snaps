import {
  VirtualFile
} from "./chunk-ZJRWU4AJ.mjs";

// src/bytes.ts
import { stringToBytes } from "@metamask/utils";
function getBytes(bytes) {
  const unwrapped = bytes instanceof VirtualFile ? bytes.value : bytes;
  if (typeof unwrapped === "string") {
    return stringToBytes(unwrapped);
  }
  return unwrapped;
}

export {
  getBytes
};
//# sourceMappingURL=chunk-6YRUDGNL.mjs.map