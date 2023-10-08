"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "validateFetchedSnap", {
    enumerable: true,
    get: function() {
        return validateFetchedSnap;
    }
});
const _icon = require("./icon");
const _validation = require("./manifest/validation");
const _snaps = require("./snaps");
function validateFetchedSnap(files) {
    (0, _validation.assertIsSnapManifest)(files.manifest.result);
    (0, _snaps.validateSnapShasum)(files);
    if (files.svgIcon) {
        (0, _icon.assertIsSnapIcon)(files.svgIcon);
    }
}

//# sourceMappingURL=validation.js.map