/**
 * Checks if array `a` is equal to array `b`. Note that this does not do a deep
 * equality check. It only checks if the arrays are the same length and if each
 * element in `a` is equal to (`===`) the corresponding element in `b`.
 *
 * @param a - The first array to compare.
 * @param b - The second array to compare.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
export function isEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Checks equality between two string arrays known to contain valid BIP-32 derivation paths.
 *
 * @param a - The first string array to compare.
 * @param b - The second string array to compare.
 * @returns - `true` if the arrays are equal, `false` otherwise.
 */
export function isDerivationPathEqual(a: string[], b: string[]): boolean {
  return (
    a.length === b.length &&
    a.every((value, index) => {
      const bValue = b[index];

      if (index === 0) {
        return value === bValue;
      }

      const aIsHardened = value.endsWith("'");
      const bIsHardened = bValue.endsWith("'");
      const aInt = aIsHardened ? value.slice(0, -1) : value;
      const bInt = bIsHardened ? bValue.slice(0, -1) : bValue;

      return (
        aIsHardened === bIsHardened && parseInt(aInt, 10) === parseInt(bInt, 10)
      );
    })
  );
}
