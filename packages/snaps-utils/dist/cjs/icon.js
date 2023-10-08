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
    SVG_MAX_BYTE_SIZE: function() {
        return SVG_MAX_BYTE_SIZE;
    },
    SVG_MAX_BYTE_SIZE_TEXT: function() {
        return SVG_MAX_BYTE_SIZE_TEXT;
    },
    assertIsSnapIcon: function() {
        return assertIsSnapIcon;
    }
});
const _utils = require("@metamask/utils");
const _issvg = /*#__PURE__*/ _interop_require_default(require("is-svg"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const SVG_MAX_BYTE_SIZE = 100000;
const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(SVG_MAX_BYTE_SIZE / 1000)}kb`;
const assertIsSnapIcon = (icon)=>{
    (0, _utils.assert)(icon.path.endsWith('.svg'), 'Expected snap icon to end in ".svg".');
    (0, _utils.assert)(Buffer.byteLength(icon.value, 'utf8') <= SVG_MAX_BYTE_SIZE, `The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`);
    (0, _utils.assert)((0, _issvg.default)(icon.toString()), 'Snap icon must be a valid SVG.');
};

//# sourceMappingURL=icon.js.map