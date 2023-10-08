"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "normalizeRelative", {
    enumerable: true,
    get: function() {
        return normalizeRelative;
    }
});
const _utils = require("@metamask/utils");
function normalizeRelative(path) {
    (0, _utils.assert)(!path.startsWith('/'));
    (0, _utils.assert)(path.search(/:|\/\//u) === -1, `Path "${path}" potentially an URI instead of local relative`);
    if (path.startsWith('./')) {
        return path.slice(2);
    }
    return path;
}

//# sourceMappingURL=path.js.map