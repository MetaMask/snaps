import { isSvg, parseSvg } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import type { VirtualFile } from './virtual-file';

export const SVG_MAX_BYTE_SIZE = 100_000;
export const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(
  SVG_MAX_BYTE_SIZE / 1000,
)}kb`;

/**
 * Asserts that a virtual file containing a Snap icon is valid.
 *
 * @param icon - A virtual file containing a Snap icon.
 */
export function assertIsSnapIcon(icon: VirtualFile) {
  assert(icon.path.endsWith('.svg'), 'Expected snap icon to end in ".svg".');

  assert(
    Buffer.byteLength(icon.value, 'utf8') <= SVG_MAX_BYTE_SIZE,
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
  const parsed = parseSvg(svg);

  if (!parsed) {
    return null;
  }

  const height = parsed['@_height'];
  const width = parsed['@_width'];

  if (height && width) {
    return { height, width };
  }

  const viewBox = parsed['@_viewBox'];
  if (viewBox) {
    const split = viewBox.split(' ');

    const viewBoxWidth = split[2];
    const viewBoxHeight = split[3];

    if (viewBoxWidth && viewBoxHeight) {
      return {
        width: parseInt(viewBoxWidth, 10),
        height: parseInt(viewBoxHeight, 10),
      };
    }
  }

  return null;
}
