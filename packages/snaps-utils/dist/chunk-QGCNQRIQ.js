"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/svg.ts
var _utils = require('@metamask/utils');
var _fastxmlparser = require('fast-xml-parser');
function parseSvg(svg) {
  try {
    const trimmed = svg.trim();
    _utils.assert.call(void 0, trimmed.length > 0);
    const parser = new (0, _fastxmlparser.XMLParser)({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    const parsed = parser.parse(trimmed, true);
    _utils.assert.call(void 0, _utils.hasProperty.call(void 0, parsed, "svg"));
    if (!_utils.isObject.call(void 0, parsed.svg)) {
      return {};
    }
    return parsed.svg;
  } catch {
    throw new Error("Snap icon must be a valid SVG.");
  }
}
function isSvg(svg) {
  try {
    parseSvg(svg);
    return true;
  } catch {
    return false;
  }
}




exports.parseSvg = parseSvg; exports.isSvg = isSvg;
//# sourceMappingURL=chunk-QGCNQRIQ.js.map