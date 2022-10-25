import { refine, Struct } from 'superstruct';

/**
 * Validate that a value has a minimum length.
 *
 * @param struct - The struct to validate.
 * @param min - The minimum length.
 * @returns The struct.
 */
export function minSize(struct: Struct<string>, min: number) {
  return refine(struct, 'minSize', (value) => {
    if (value.length < min) {
      return `Expected a string with a length of at least \`${min}\` but received one with a length of \`${value.length}\``;
    }

    return true;
  });
}
