import type { Json } from '@metamask/utils';
import { getSafeJson } from '@metamask/utils';

// TODO: Upstream this to @metamask/utils

/**
 * Parse JSON safely.
 *
 * Does multiple kinds of validation and strips unwanted properties like
 * `__proto__` and `constructor`.
 *
 * @param json - A JSON string to be parsed.
 * @returns The parsed JSON object.
 * @template Type - The type of the JSON object. The type is not actually
 * checked, but it is used to infer the return type.
 */
export function parseJson<Type extends Json = Json>(json: string) {
  return getSafeJson<Type>(JSON.parse(json));
}

/**
 * Get the size of a JSON blob without validating that is valid JSON.
 *
 * This may sometimes be preferred over `getJsonSize` for performance reasons.
 *
 * Note: By default this function does not encode the string to bytes, thus the input may
 * be about 4x larger in practice. Use this function with caution.
 *
 * @param value - The JSON value to get the size of.
 * @param encode - Whether the value should be encoded before measuring.
 * @returns The size of the JSON value in bytes.
 */
export function getJsonSizeUnsafe(value: Json, encode = false): number {
  const json = JSON.stringify(value);
  // We intentionally don't use `TextEncoder` by default because of bad performance on React Native.
  return encode ? new TextEncoder().encode(json).byteLength : json.length;
}
