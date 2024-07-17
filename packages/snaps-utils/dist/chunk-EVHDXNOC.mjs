// src/svg.ts
import { assert, hasProperty, isObject } from "@metamask/utils";
import { XMLParser } from "fast-xml-parser";
function parseSvg(svg) {
  try {
    const trimmed = svg.trim();
    assert(trimmed.length > 0);
    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true
    });
    const parsed = parser.parse(trimmed, true);
    assert(hasProperty(parsed, "svg"));
    if (!isObject(parsed.svg)) {
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

export {
  parseSvg,
  isSvg
};
//# sourceMappingURL=chunk-EVHDXNOC.mjs.map