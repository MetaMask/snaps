import {
  decodeBase64
} from "./chunk-JJTIVHFX.mjs";
import {
  MAX_FILE_SIZE
} from "./chunk-SPCIIRSB.mjs";

// src/auxiliary-files.ts
import { AuxiliaryFileEncoding } from "@metamask/snaps-sdk";
import { assert, bytesToHex, bytesToString } from "@metamask/utils";
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
function validateAuxiliaryFiles(files) {
  for (const file of files) {
    assert(
      file.size < MAX_FILE_SIZE,
      "Static files required by the Snap must be smaller than 64 MB."
    );
  }
}

export {
  encodeAuxiliaryFile,
  validateAuxiliaryFiles
};
//# sourceMappingURL=chunk-VIAHMNTA.mjs.map