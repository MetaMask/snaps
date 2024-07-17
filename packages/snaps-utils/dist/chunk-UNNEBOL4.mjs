// src/json.ts
import { getSafeJson } from "@metamask/utils";
function parseJson(json) {
  return getSafeJson(JSON.parse(json));
}
function getJsonSizeUnsafe(value) {
  const json = JSON.stringify(value);
  return new TextEncoder().encode(json).byteLength;
}

export {
  parseJson,
  getJsonSizeUnsafe
};
//# sourceMappingURL=chunk-UNNEBOL4.mjs.map