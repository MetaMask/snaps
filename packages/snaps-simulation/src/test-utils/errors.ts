/**
 * Format types for error messages based on the number of types.
 *
 * @param types - Array of type names.
 * @returns Formatted string for error message.
 */
export function formatTypeErrorMessage(types: string[]): string {
  if (types.length === 1) {
    return `"${types[0]}"`;
  }

  if (types.length === 2) {
    return `"${types[0]}" or "${types[1]}"`;
  }

  const lastType = types[types.length - 1];
  const otherTypes = types
    .slice(0, -1)
    .map((type) => `"${type}"`)
    .join(', ');

  return `${otherTypes} or "${lastType}"`;
}
