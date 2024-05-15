"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/icon.ts
var _snapssdk = require('@metamask/snaps-sdk');
var _utils = require('@metamask/utils');
var SVG_MAX_BYTE_SIZE = 1e5;
var SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(
  SVG_MAX_BYTE_SIZE / 1e3
)}kb`;
function assertIsSnapIcon(icon) {
  _utils.assert.call(void 0, icon.path.endsWith(".svg"), 'Expected snap icon to end in ".svg".');
  const byteLength = typeof icon.value === "string" ? _utils.stringToBytes.call(void 0, icon.value).byteLength : icon.value.byteLength;
  _utils.assert.call(void 0, 
    byteLength <= SVG_MAX_BYTE_SIZE,
    `The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`
  );
  _utils.assert.call(void 0, _snapssdk.isSvg.call(void 0, icon.toString()), "Snap icon must be a valid SVG.");
}
function getSvgDimensions(svg) {
  try {
    const parsed = _snapssdk.parseSvg.call(void 0, svg);
    const height = parsed["@_height"];
    const width = parsed["@_width"];
    if (height && width) {
      return { height, width };
    }
    const viewBox = parsed["@_viewBox"];
    if (viewBox) {
      const [_minX, _minY, viewBoxWidth, viewBoxHeight] = viewBox.split(" ");
      if (viewBoxWidth && viewBoxHeight) {
        const parsedWidth = parseInt(viewBoxWidth, 10);
        const parsedHeight = parseInt(viewBoxHeight, 10);
        _utils.assert.call(void 0, Number.isInteger(parsedWidth) && parsedWidth > 0);
        _utils.assert.call(void 0, Number.isInteger(parsedHeight) && parsedHeight > 0);
        return {
          width: parsedWidth,
          height: parsedHeight
        };
      }
    }
  } catch {
    throw new Error("Snap icon must be a valid SVG.");
  }
  return null;
}






exports.SVG_MAX_BYTE_SIZE = SVG_MAX_BYTE_SIZE; exports.SVG_MAX_BYTE_SIZE_TEXT = SVG_MAX_BYTE_SIZE_TEXT; exports.assertIsSnapIcon = assertIsSnapIcon; exports.getSvgDimensions = getSvgDimensions;
//# sourceMappingURL=chunk-M3KAAQFK.js.map