// Special entrypoint for execution environments for bundle sizing reasons
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
_export_star(require("./handlers"), exports);
_export_star(require("./logging"), exports);
_export_star(require("./namespace"), exports);
_export_star(require("./types"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}

//# sourceMappingURL=index.executionenv.js.map