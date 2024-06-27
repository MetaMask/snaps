"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/snaps/location/http.ts







var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
var HttpLocation = class {
  constructor(url, opts = {}) {
    // We keep contents separate because then we can use only one Blob in cache,
    // which we convert to Uint8Array when actually returning the file.
    //
    // That avoids deepCloning file contents.
    // I imagine ArrayBuffers are copy-on-write optimized, meaning
    // in most often case we'll only have one file contents in common case.
    this.cache = /* @__PURE__ */ new Map();
    _utils.assertStruct.call(void 0, url.toString(), _snapsutils.HttpSnapIdStruct, "Invalid Snap Id: ");
    this.fetchFn = opts.fetch ?? globalThis.fetch.bind(globalThis);
    this.fetchOptions = opts.fetchOptions;
    this.url = url;
  }
  async manifest() {
    if (this.validatedManifest) {
      return this.validatedManifest.clone();
    }
    const canonicalPath = new URL(
      _snapsutils.NpmSnapFileNames.Manifest,
      this.url
    ).toString();
    const response = await this.fetchFn(canonicalPath, this.fetchOptions);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch "${canonicalPath}". Status code: ${response.status}.`
      );
    }
    const contents = await response.text();
    const manifest = _snapsutils.parseJson.call(void 0, contents);
    const vfile = new (0, _snapsutils.VirtualFile)({
      value: contents,
      result: _snapsutils.createSnapManifest.call(void 0, manifest),
      path: _snapsutils.NpmSnapFileNames.Manifest,
      data: { canonicalPath }
    });
    this.validatedManifest = vfile;
    return this.manifest();
  }
  async fetch(path) {
    const relativePath = _snapsutils.normalizeRelative.call(void 0, path);
    const cached = this.cache.get(relativePath);
    if (cached !== void 0) {
      const { file, contents } = cached;
      const value = new Uint8Array(await contents.arrayBuffer());
      const vfile2 = file.clone();
      vfile2.value = value;
      return vfile2;
    }
    const canonicalPath = this.toCanonical(relativePath).toString();
    const response = await this.fetchFn(canonicalPath, this.fetchOptions);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch "${canonicalPath}". Status code: ${response.status}.`
      );
    }
    const vfile = new (0, _snapsutils.VirtualFile)({
      value: "",
      path: relativePath,
      data: { canonicalPath }
    });
    const blob = await response.blob();
    _utils.assert.call(void 0, 
      !this.cache.has(relativePath),
      "Corrupted cache, multiple files with same path."
    );
    this.cache.set(relativePath, { file: vfile, contents: blob });
    return this.fetch(relativePath);
  }
  get root() {
    return new URL(this.url);
  }
  toCanonical(path) {
    _utils.assert.call(void 0, !path.startsWith("/"), "Tried to parse absolute path.");
    return new URL(path, this.url);
  }
};



exports.HttpLocation = HttpLocation;
//# sourceMappingURL=chunk-RDBT3ZJQ.js.map