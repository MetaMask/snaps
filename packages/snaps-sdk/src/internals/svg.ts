import { assert, hasProperty, isObject } from '@metamask/utils';
import { XMLParser } from 'fast-xml-parser';

/**
 * Parse and validate a string as an SVG.
 *
 * @param svg - An SVG string.
 * @returns The SVG, its attributes and children in an object format.
 */
export function parseSvg(svg: string) {
  try {
    const trimmed = svg.trim();

    assert(trimmed.length > 0);

    const parser = new XMLParser({
      ignoreAttributes: false,
      parseAttributeValue: true,
    });
    const parsed = parser.parse(trimmed, true);

    assert(hasProperty(parsed, 'svg'));

    // Empty SVGs are not returned as objects
    if (!isObject(parsed.svg)) {
      return {};
    }

    return parsed.svg;
  } catch {
    throw new Error('Snap icon must be a valid SVG.');
  }
}

/**
 * Validate that a string is a valid SVG.
 *
 * @param svg - An SVG string.
 * @returns True if the SVG is valid otherwise false.
 */
export function isSvg(svg: string) {
  try {
    parseSvg(svg);
    return true;
  } catch {
    return false;
  }
}
