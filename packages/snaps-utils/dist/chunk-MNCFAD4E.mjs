// src/icon.ts
import { isSvg, parseSvg } from "@metamask/snaps-sdk";
import { assert, stringToBytes } from "@metamask/utils";
var SVG_MAX_BYTE_SIZE = 1e5;
var SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(
  SVG_MAX_BYTE_SIZE / 1e3
)}kb`;
function assertIsSnapIcon(icon) {
  assert(icon.path.endsWith(".svg"), 'Expected snap icon to end in ".svg".');
  const byteLength = typeof icon.value === "string" ? stringToBytes(icon.value).byteLength : icon.value.byteLength;
  assert(
    byteLength <= SVG_MAX_BYTE_SIZE,
    `The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`
  );
  assert(isSvg(icon.toString()), "Snap icon must be a valid SVG.");
}
function getSvgDimensions(svg) {
  try {
    const parsed = parseSvg(svg);
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
        assert(Number.isInteger(parsedWidth) && parsedWidth > 0);
        assert(Number.isInteger(parsedHeight) && parsedHeight > 0);
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

export {
  SVG_MAX_BYTE_SIZE,
  SVG_MAX_BYTE_SIZE_TEXT,
  assertIsSnapIcon,
  getSvgDimensions
};
//# sourceMappingURL=chunk-MNCFAD4E.mjs.map