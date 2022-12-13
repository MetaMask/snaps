/**
 * Flattens an array of arrays of up to 1 level deep into a single array.
 *
 * This is a non-recursive implementation of `Array.prototype.flat`, which is
 * only available in ES2019 and above.
 *
 * @param array - The array to flatten.
 * @returns The flattened array.
 */
export const flatten = <Type>(array: (Type | Type[])[]): Type[] => {
  return array.reduce<Type[]>((acc, cur) => {
    if (Array.isArray(cur)) {
      return [...acc, ...cur];
    }
    acc.push(cur);
    return acc;
  }, []);
};

/**
 * Maps an array of values using the provided callback, then flattens the result
 * into a single array, up to 1 level deep.
 *
 * This is a non-recursive implementation of `Array.prototype.flatMap`, which is
 * only available in ES2019 and above.
 *
 * @param array - The array to map.
 * @param callback - The callback to map each value with.
 * @returns The mapped and flattened array.
 */
export const flatMap = <Type, Return>(
  array: Type[],
  callback: (value: Type) => Return | Return[],
): Return[] => {
  return flatten(array.map(callback));
};

export type Equals<Type> = (a: Type, b: Type) => boolean;

export type UniqOptions<Type> = {
  /**
   * Allows using a faster algorithm if the array is already sorted.
   *
   * @default false
   */
  isSorted?: boolean;
  /**
   * The function to use to compare values inside the array.
   *
   * Uses strict equality comparison (`===`) if not provided.
   */
  equals?: Equals<Type>;
};

/**
 * Create a new, duplicate free array.
 *
 * If the array is sorted, you can pass `isSorted = true` to options and a faster algorithm will be used.
 *
 * If `options.equals` is not provided, strict equality comparison (`===`) is used.
 *
 * @param array - The original array that should have duplicates removed.
 * @param options - Options that modify how the unique value is found.
 * @returns A new array containing original elements from the `array` without the duplicates.
 */
export function unique<Type>(array: Type[], options: UniqOptions<Type> = {}) {
  const isSorted = options.isSorted ?? false;
  let last!: Type;
  const result: Type[] = [];
  const equals =
    options.equals ?? (isSorted ? (a: Type, b: Type) => a === b : undefined);
  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (isSorted) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (!i || !equals!(value, last)) {
        result.push(value);
      }
      last = value;
    } else if (!includes(result, value, equals)) {
      result.push(value);
    }
  }
  return result;
}

/**
 * Determines whether the array contains a given argument.
 *
 * If `equals` is not provided, strict equality comparison (`===`) is used.
 *
 * @param array - The array to search through.
 * @param needle - The value to locate in the array.
 * @param equals - An optional function that is used to compare values in the array to the `needle`.
 * @returns Whether the value exists in the array.
 */
export function includes<Type>(
  array: Type[],
  needle: Type,
  equals?: Equals<Type>,
): boolean {
  return indexOf(array, needle, equals) >= 0;
}

/**
 * Returns the index of the first occurrence of a value in an array, or -1 if it is not present.
 *
 * If `equals` is not provided, strict equality comparison (`===`) is used.
 *
 * @param array - The array to search through.
 * @param needle - The value to locate in the array.
 * @param equals - An optional function that is used to compare values in the array to the `needle`.
 * @returns Index of the first occurrence, -1 if not present.
 */
export function indexOf<Type>(
  array: Type[],
  needle: Type,
  equals?: Equals<Type>,
): number {
  if (!equals) {
    return array.indexOf(needle);
  }

  for (let i = 0; i < array.length; i++) {
    const value = array[i];
    if (equals(value, needle)) {
      return i;
    }
  }
  return -1;
}
