import { refine, string } from '@metamask/superstruct';

/**
 * Get a Struct that validates a string as a valid SVG.
 *
 * @returns A Struct that validates a string as a valid SVG.
 * @internal
 */
export function svg() {
  return refine(string(), 'SVG', (value) => {
    // This validation is intentionally very basic, we don't need to be that strict
    // and merely have this extra validation as a helpful error if devs aren't
    // passing in SVGs.
    if (!value.includes('<svg')) {
      return 'Value is not a valid SVG.';
    }

    return true;
  });
}
