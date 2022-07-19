/**
 * Checks whether a URL is valid.
 *
 * @param maybeUrl - The string to check.
 * @returns Whether the specified string is a valid URL.
 */
export function isValidUrl(maybeUrl: string): maybeUrl is string {
  try {
    return Boolean(new URL(maybeUrl));
  } catch (_error) {
    return false;
  }
}
