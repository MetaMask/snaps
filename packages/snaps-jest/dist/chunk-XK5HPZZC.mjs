// src/internals/environment.ts
import { assert } from "@metamask/utils";
function getEnvironment() {
  assert(
    typeof snapsEnvironment !== "undefined",
    "Snaps environment not found. Make sure you have configured the environment correctly."
  );
  return snapsEnvironment;
}

export {
  getEnvironment
};
//# sourceMappingURL=chunk-XK5HPZZC.mjs.map