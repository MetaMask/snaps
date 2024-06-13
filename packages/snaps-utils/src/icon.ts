import { assert, stringToBytes } from '@metamask/utils';

import { isSvg, parseSvg } from './svg';
import type { VirtualFile } from './virtual-file';

export const SVG_MAX_BYTE_SIZE = 100_000;
export const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(
  SVG_MAX_BYTE_SIZE / 1000,
)}kb`;

/**
 * Assert that a virtual file containing a Snap icon is valid.
 *
 * @param icon - A virtual file containing a Snap icon.
 */
export function assertIsSnapIcon(icon: VirtualFile) {
  assert(icon.path.endsWith('.svg'), 'Expected snap icon to end in ".svg".');

  const byteLength =
    typeof icon.value === 'string'
      ? stringToBytes(icon.value).byteLength
      : icon.value.byteLength;

  assert(
    byteLength <= SVG_MAX_BYTE_SIZE,
    `The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`,
  );

  assert(isSvg(icon.toString()), 'Snap icon must be a valid SVG.');
}

/**
 * Extract the dimensions of an image from an SVG string if possible.
 *
 * @param svg - An SVG string.
 * @returns The height and width of the SVG or null.
 */
export function getSvgDimensions(svg: string): {
  height: number;
  width: number;
} | null {
  try {
    const parsed = parseSvg(svg);

    const height = parsed['@_height'];
    const width = parsed['@_width'];

    if (height && width) {
      return { height, width };
    }

    const viewBox = parsed['@_viewBox'];
    if (viewBox) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [_minX, _minY, viewBoxWidth, viewBoxHeight] = viewBox.split(' ');

      if (viewBoxWidth && viewBoxHeight) {
        const parsedWidth = parseInt(viewBoxWidth, 10);
        const parsedHeight = parseInt(viewBoxHeight, 10);

        assert(Number.isInteger(parsedWidth) && parsedWidth > 0);
        assert(Number.isInteger(parsedHeight) && parsedHeight > 0);

        return {
          width: parsedWidth,
          height: parsedHeight,
        };
      }
    }
  } catch {
    throw new Error('Snap icon must be a valid SVG.');
  }

  return null;
}
