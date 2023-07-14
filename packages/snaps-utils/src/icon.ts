import { assert } from '@metamask/utils';
import isSvg from 'is-svg';

import type { VirtualFile } from './virtual-file';

export const SVG_MAX_BYTE_SIZE = 100_000;
export const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(
  SVG_MAX_BYTE_SIZE / 1000,
)}kb`;

export const assertIsSnapIcon = (icon: VirtualFile) => {
  assert(icon.path.endsWith('.svg'), 'Expected snap icon to end in ".svg".');

  assert(
    Buffer.byteLength(icon.value, 'utf8') <= SVG_MAX_BYTE_SIZE,
    `The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`,
  );

  assert(isSvg(icon.toString()), 'Snap icon must be a valid SVG.');
};
