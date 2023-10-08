"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    checksum: function() {
        return checksum;
    },
    checksumFiles: function() {
        return checksumFiles;
    }
});
const _utils = require("@metamask/utils");
const _sha256 = require("@noble/hashes/sha256");
const _VirtualFile = require("./virtual-file/VirtualFile");
function checksum(bytes) {
    const value = bytes instanceof _VirtualFile.VirtualFile ? bytes.value : bytes;
    return (0, _sha256.sha256)(value);
}
function checksumFiles(files) {
    return checksum((0, _utils.concatBytes)([
        ...files
    ].sort((a, b)=>{
        (0, _utils.assert)(a.path !== b.path, 'Tried to sort files with non-unique paths.');
        if (a.path < b.path) {
            return -1;
        }
        return 1;
    }).map((file)=>checksum(file))));
}

//# sourceMappingURL=checksum.js.map