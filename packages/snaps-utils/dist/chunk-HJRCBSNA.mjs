import {
  getBytes
} from "./chunk-6YRUDGNL.mjs";

// src/checksum.ts
import { assert, concatBytes } from "@metamask/utils";
import { sha256 } from "@noble/hashes/sha256";
async function checksum(bytes) {
  const value = getBytes(bytes);
  if ("crypto" in globalThis && typeof globalThis.crypto === "object" && crypto.subtle?.digest) {
    return new Uint8Array(await crypto.subtle.digest("SHA-256", value));
  }
  return sha256(value);
}
async function checksumFiles(files) {
  const checksums = await Promise.all(
    [...files].sort((a, b) => {
      assert(a.path !== b.path, "Tried to sort files with non-unique paths.");
      if (a.path < b.path) {
        return -1;
      }
      return 1;
    }).map(async (file) => checksum(file))
  );
  return checksum(concatBytes(checksums));
}

export {
  checksum,
  checksumFiles
};
//# sourceMappingURL=chunk-HJRCBSNA.mjs.map