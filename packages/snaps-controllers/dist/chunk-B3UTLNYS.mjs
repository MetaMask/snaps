import {
  HttpLocation
} from "./chunk-6GMWL4JR.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/snaps/location/local.ts
import { LocalSnapIdStruct, SnapIdPrefixes } from "@metamask/snaps-utils";
import { assert, assertStruct } from "@metamask/utils";
var _http;
var LocalLocation = class {
  constructor(url, opts = {}) {
    __privateAdd(this, _http, void 0);
    assertStruct(url.toString(), LocalSnapIdStruct, "Invalid Snap Id");
    assert(
      opts.fetchOptions === void 0,
      "Currently adding fetch options to local: is unsupported."
    );
    __privateSet(this, _http, new HttpLocation(
      new URL(url.toString().slice(SnapIdPrefixes.local.length)),
      { ...opts, fetchOptions: { cache: "no-cache" } }
    ));
  }
  async manifest() {
    const vfile = await __privateGet(this, _http).manifest();
    return convertCanonical(vfile);
  }
  async fetch(path) {
    return convertCanonical(await __privateGet(this, _http).fetch(path));
  }
  get shouldAlwaysReload() {
    return true;
  }
};
_http = new WeakMap();
function convertCanonical(vfile) {
  assert(vfile.data.canonicalPath !== void 0);
  vfile.data.canonicalPath = `local:${vfile.data.canonicalPath}`;
  return vfile;
}

export {
  LocalLocation
};
//# sourceMappingURL=chunk-B3UTLNYS.mjs.map