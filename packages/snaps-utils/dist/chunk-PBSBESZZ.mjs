import {
  assertIsSnapManifest
} from "./chunk-HTS6HGUU.mjs";
import {
  validateSnapShasum
} from "./chunk-2M6G46W6.mjs";
import {
  assertIsSnapIcon
} from "./chunk-MNCFAD4E.mjs";
import {
  validateSnapManifestLocalizations
} from "./chunk-WZ457PEQ.mjs";

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
//# sourceMappingURL=chunk-PBSBESZZ.mjs.map