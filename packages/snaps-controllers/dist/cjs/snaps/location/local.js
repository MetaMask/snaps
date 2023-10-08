"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "LocalLocation", {
    enumerable: true,
    get: function() {
        return LocalLocation;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _http = require("./http");
function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
var _http1 = /*#__PURE__*/ new WeakMap();
class LocalLocation {
    async manifest() {
        const vfile = await _class_private_field_get(this, _http1).manifest();
        return convertCanonical(vfile);
    }
    async fetch(path) {
        return convertCanonical(await _class_private_field_get(this, _http1).fetch(path));
    }
    get shouldAlwaysReload() {
        return true;
    }
    constructor(url, opts = {}){
        _class_private_field_init(this, _http1, {
            writable: true,
            value: void 0
        });
        (0, _utils.assertStruct)(url.toString(), _snapsutils.LocalSnapIdStruct, 'Invalid Snap Id');
        // TODO(ritave): Write deepMerge() which merges fetchOptions.
        (0, _utils.assert)(opts.fetchOptions === undefined, 'Currently adding fetch options to local: is unsupported.');
        _class_private_field_set(this, _http1, new _http.HttpLocation(new URL(url.toString().slice(_snapsutils.SnapIdPrefixes.local.length)), {
            ...opts,
            fetchOptions: {
                cache: 'no-cache'
            }
        }));
    }
}
/**
 * Converts vfiles with canonical `http:` paths into `local:` paths.
 *
 * @param vfile - The {@link VirtualFile} to convert.
 * @returns The same object with updated `.data.canonicalPath`.
 */ function convertCanonical(vfile) {
    (0, _utils.assert)(vfile.data.canonicalPath !== undefined);
    vfile.data.canonicalPath = `local:${vfile.data.canonicalPath}`;
    return vfile;
}

//# sourceMappingURL=local.js.map