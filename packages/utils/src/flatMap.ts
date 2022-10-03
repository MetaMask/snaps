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
