import {
  VirtualFile
} from "./chunk-DE22V5AO.mjs";

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
//# sourceMappingURL=chunk-3S4INAGA.mjs.map