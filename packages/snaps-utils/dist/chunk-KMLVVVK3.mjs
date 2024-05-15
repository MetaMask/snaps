import {
  decodeBase64
} from "./chunk-FOWIC2SO.mjs";

// src/auxiliary-files.ts
import { AuxiliaryFileEncoding } from "@metamask/snaps-sdk";
import { bytesToHex, bytesToString } from "@metamask/utils";
async function encodeAuxiliaryFile(value, encoding) {
  if (encoding === AuxiliaryFileEncoding.Base64) {
    return value;
  }
  const decoded = await decodeBase64(value);
  if (encoding === AuxiliaryFileEncoding.Utf8) {
    return bytesToString(decoded);
  }
  return bytesToHex(decoded);
}

export {
  encodeAuxiliaryFile
};
//# sourceMappingURL=chunk-KMLVVVK3.mjs.map