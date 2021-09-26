type PlainObject = Record<number | string | symbol, unknown>;

export function isPlainObject(value: unknown): value is PlainObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export const hasProperty = (
  object: PlainObject,
  key: string | number | symbol,
) => Reflect.hasOwnProperty.call(object, key);

/**
 * Like {@link Array}, but always non-empty.
 */
export type NonEmptyArray<T> = [T, ...T[]];
