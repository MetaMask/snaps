import type { Json } from '@metamask/utils';
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
export declare function parseJson<Type extends Json = Json>(json: string): Type;
/**
 * Get the size of a JSON blob without validating that is valid JSON.
 *
 * This may sometimes be preferred over `getJsonSize` for performance reasons.
 *
 * @param value - The JSON value to get the size of.
 * @returns The size of the JSON value in bytes.
 */
export declare function getJsonSizeUnsafe(value: Json): number;
