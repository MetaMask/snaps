import { getSafeJson } from '@metamask/utils';

// TODO: Upstream this to @metamask/utils

/**
 * Parses JSON safely.
 *
 * Does multiple kinds of validation and strips unwanted properties like __proto__.
 *
 * @param json - A JSON string to be parsed.
 * @returns The parsed JSON object.
 */
export function parseJson(json: string) {
  return getSafeJson(JSON.parse(json));
}
