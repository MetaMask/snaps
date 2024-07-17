import type { VirtualFile } from './virtual-file';
export declare const SVG_MAX_BYTE_SIZE = 100000;
export declare const SVG_MAX_BYTE_SIZE_TEXT: string;
/**
 * Assert that a virtual file containing a Snap icon is valid.
 *
 * @param icon - A virtual file containing a Snap icon.
 */
export declare function assertIsSnapIcon(icon: VirtualFile): void;
/**
 * Extract the dimensions of an image from an SVG string if possible.
 *
 * @param svg - An SVG string.
 * @returns The height and width of the SVG or null.
 */
export declare function getSvgDimensions(svg: string): {
    height: number;
    width: number;
} | null;
