import type { Struct } from '@metamask/superstruct';
import { coerce, create, literal } from '@metamask/superstruct';

/**
 * A wrapper of Superstruct's `literal` struct that accepts a value in either
 * completely lowercase or completely uppercase (i.e., "usd" or "USD").
 *
 * @param string - The currency symbol.
 * @returns The struct that accepts the currency symbol in either case. It will
 * return the currency symbol in lowercase.
 */
export function currency<Value extends string>(
  string: Value,
): Struct<Lowercase<Value> | Uppercase<Value>> {
  const lowerCase = string.toLowerCase();

  return coerce(literal(lowerCase), literal(string.toUpperCase()), (value) => {
    return create(value.toLowerCase(), literal(lowerCase));
  }) as Struct<Lowercase<Value> | Uppercase<Value>>;
}
