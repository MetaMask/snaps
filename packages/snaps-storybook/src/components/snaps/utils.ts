import { bytesToBase64, stringToBytes } from '@metamask/utils';

/**
 * Get the image data URL for an SVG string.
 *
 * @param svg - The SVG string to convert to a data URL.
 * @returns The data URL for the SVG image.
 */
export function getImage(svg: string) {
  return `data:image/svg+xml;base64,${bytesToBase64(stringToBytes(svg))}`;
}
