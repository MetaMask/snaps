// src/path.ts
import { assert } from "@metamask/utils";
function normalizeRelative(path) {
  assert(!path.startsWith("/"));
  assert(
    path.search(/:|\/\//u) === -1,
    `Path "${path}" potentially an URI instead of local relative`
  );
  if (path.startsWith("./")) {
    return path.slice(2);
  }
  return path;
}

export {
  normalizeRelative
};
//# sourceMappingURL=chunk-UW74NLTC.mjs.map