/**
 * Parse and validate a string as an SVG.
 *
 * @param svg - An SVG string.
 * @returns The SVG, its attributes and children in an object format.
 */
export declare function parseSvg(svg: string): any;
/**
 * Validate that a string is a valid SVG.
 *
 * @param svg - An SVG string.
 * @returns True if the SVG is valid otherwise false.
 */
export declare function isSvg(svg: string): boolean;
