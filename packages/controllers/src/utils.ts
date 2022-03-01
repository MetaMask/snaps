import { Json } from '@metamask/controllers';
import deepEqual from 'fast-deep-equal';

/**
 * @param timestamp - A Unix millisecond timestamp.
 * @returns The number of milliseconds elapsed since the specified timestamp.
 */
export function timeSince(timestamp: number): number {
  return Date.now() - timestamp;
}

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
 *
 * @template T - The non-empty array member type.
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * {@link NonEmptyArray} type guard.
 *
 * @template T - The non-empty array member type.
 * @param value - The value to check.
 * @returns Whether the value is a non-empty array.
 */
export function isNonEmptyArray<T>(value: T[]): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

/**
 * {@link Json} type guard.
 *
 * @param value - The value to check.
 * @returns Whether the value is valid JSON.
 */
export function isValidJson(value: unknown): value is Json {
  try {
    return deepEqual(value, JSON.parse(JSON.stringify(value)));
  } catch (_) {
    return false;
  }
}

export function objectDiff<A, B>(a: A, b: B): Diff<A, B> {
  return Object.entries(a).reduce((acc, [key, value]) => {
    if (key in b) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {} as any);
}

/**
 * Checks whether the type is composed of literal types
 * @returns @type {true} if whole type is composed of literals, @type {false} if whole type is not literals, @type {boolean} if mixed
 *
 * @example
 * ```
 * type t1 = IsLiteral<1 | 2 | "asd" | true>;
 * // t1 = true
 *
 * type t2 = IsLiteral<number | string>;
 * // t2 = false
 *
 * type t3 = IsLiteral<1 | string>;
 * // t3 = boolean
 *
 * const s = Symbol();
 * type t4 = IsLiteral<typeof s>;
 * // t4 = true
 *
 * type t5 = IsLiteral<symbol>
 * // t5 = false;
 * ```
 */
type IsLiteral<T> = T extends string | number | boolean | symbol
  ? Extract<string | number | boolean | symbol, T> extends never
    ? true
    : false
  : false;

type _LiteralKeys<T> = NonNullable<
  {
    [Key in keyof T]: IsLiteral<Key> extends true ? Key : never;
  }[keyof T]
>;
type _NonLiteralKeys<T> = NonNullable<
  {
    [Key in keyof T]: IsLiteral<Key> extends false ? Key : never;
  }[keyof T]
>;
/**
 * A difference of two objects based on their keys
 *
 * @example
 * ```
 * type t1 = Diff<{a: string, b: string}, {a: number}>
 * // t1 = {b: string};
 * type t2 = Diff<{a: string, 0: string}, Record<string, unknown>>;
 * // t2 = { a?: string, 0: string};
 * type t3 = Diff<{a: string, 0: string, 1: string}, Record<1 | string, unknown>>;
 * // t3 = {a?: string, 0: string}
 * ```
 */
export type Diff<A, B> = Omit<A, _LiteralKeys<B>> &
  Partial<Pick<A, Extract<keyof A, _NonLiteralKeys<B>>>>;

/**
 * Makes every specified property of the specified object type mutable.
 *
 * @template T - The object whose readonly properties to make mutable.
 * @template TargetKey - The property key(s) to make mutable.
 */
export type Mutable<
  T extends Record<string, unknown>,
  TargetKey extends string,
> = {
  -readonly [Key in keyof Pick<T, TargetKey>]: T[Key];
} &
  {
    [Key in keyof Omit<T, TargetKey>]: T[Key];
  };
