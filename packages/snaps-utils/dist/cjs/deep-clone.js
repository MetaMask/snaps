"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "deepClone", {
    enumerable: true,
    get: function() {
        return deepClone;
    }
});
const _rfdc = /*#__PURE__*/ _interop_require_default(require("rfdc"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const deepClone = (0, _rfdc.default)({
    proto: false,
    circles: false
});

//# sourceMappingURL=deep-clone.js.map