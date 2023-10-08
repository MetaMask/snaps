"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "HttpLocation", {
    enumerable: true,
    get: function() {
        return HttpLocation;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class HttpLocation {
    async manifest() {
        if (this.validatedManifest) {
            return this.validatedManifest.clone();
        }
        // jest-fetch-mock doesn't handle new URL(), we need to convert .toString()
        const canonicalPath = new URL(_snapsutils.NpmSnapFileNames.Manifest, this.url).toString();
        const response = await this.fetchFn(canonicalPath, this.fetchOptions);
        if (!response.ok) {
            throw new Error(`Failed to fetch "${canonicalPath}". Status code: ${response.status}.`);
        }
        const contents = await response.text();
        const manifest = (0, _snapsutils.parseJson)(contents);
        const vfile = new _snapsutils.VirtualFile({
            value: contents,
            result: (0, _snapsutils.createSnapManifest)(manifest),
            path: _snapsutils.NpmSnapFileNames.Manifest,
            data: {
                canonicalPath
            }
        });
        this.validatedManifest = vfile;
        return this.manifest();
    }
    async fetch(path) {
        const relativePath = (0, _snapsutils.normalizeRelative)(path);
        const cached = this.cache.get(relativePath);
        if (cached !== undefined) {
            const { file, contents } = cached;
            const value = new Uint8Array(await contents.arrayBuffer());
            const vfile = file.clone();
            vfile.value = value;
            return vfile;
        }
        const canonicalPath = this.toCanonical(relativePath).toString();
        const response = await this.fetchFn(canonicalPath, this.fetchOptions);
        if (!response.ok) {
            throw new Error(`Failed to fetch "${canonicalPath}". Status code: ${response.status}.`);
        }
        const vfile = new _snapsutils.VirtualFile({
            value: '',
            path: relativePath,
            data: {
                canonicalPath
            }
        });
        const blob = await response.blob();
        (0, _utils.assert)(!this.cache.has(relativePath), 'Corrupted cache, multiple files with same path.');
        this.cache.set(relativePath, {
            file: vfile,
            contents: blob
        });
        return this.fetch(relativePath);
    }
    get root() {
        return new URL(this.url);
    }
    toCanonical(path) {
        (0, _utils.assert)(!path.startsWith('/'), 'Tried to parse absolute path.');
        return new URL(path, this.url);
    }
    constructor(url, opts = {}){
        // We keep contents separate because then we can use only one Blob in cache,
        // which we convert to Uint8Array when actually returning the file.
        //
        // That avoids deepCloning file contents.
        // I imagine ArrayBuffers are copy-on-write optimized, meaning
        // in most often case we'll only have one file contents in common case.
        _define_property(this, "cache", new Map());
        _define_property(this, "validatedManifest", void 0);
        _define_property(this, "url", void 0);
        _define_property(this, "fetchFn", void 0);
        _define_property(this, "fetchOptions", void 0);
        (0, _utils.assertStruct)(url.toString(), _snapsutils.HttpSnapIdStruct, 'Invalid Snap Id: ');
        this.fetchFn = opts.fetch ?? globalThis.fetch.bind(globalThis);
        this.fetchOptions = opts.fetchOptions;
        this.url = url;
    }
}

//# sourceMappingURL=http.js.map