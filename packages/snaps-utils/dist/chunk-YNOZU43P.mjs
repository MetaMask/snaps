import {
  assertIsSnapManifest
} from "./chunk-ZXHR322P.mjs";
import {
  validateSnapShasum
} from "./chunk-H35ZUVQT.mjs";
import {
  validateSnapManifestLocalizations
} from "./chunk-CJK7DDV2.mjs";
import {
  assertIsSnapIcon
} from "./chunk-PTOH2SVI.mjs";

// src/validation.ts
async function validateFetchedSnap(files) {
  assertIsSnapManifest(files.manifest.result);
  await validateSnapShasum(files);
  validateSnapManifestLocalizations(
    files.manifest.result,
    files.localizationFiles.map((file) => file.result)
  );
  if (files.svgIcon) {
    assertIsSnapIcon(files.svgIcon);
  }
}

export {
  validateFetchedSnap
};
//# sourceMappingURL=chunk-YNOZU43P.mjs.map