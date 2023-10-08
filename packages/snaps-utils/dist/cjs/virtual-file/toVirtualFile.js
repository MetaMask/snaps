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
    readVirtualFile: function() {
        return readVirtualFile;
    },
    writeVirtualFile: function() {
        return writeVirtualFile;
    }
});
const _fs = require("fs");
const _VirtualFile = require("./VirtualFile");
async function readVirtualFile(path, encoding = null) {
    return new _VirtualFile.VirtualFile({
        path,
        value: await _fs.promises.readFile(path, {
            encoding
        })
    });
}
async function writeVirtualFile(vfile, options) {
    return _fs.promises.writeFile(vfile.path, vfile.value, options);
}

//# sourceMappingURL=toVirtualFile.js.map