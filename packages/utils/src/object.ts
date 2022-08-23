/**
 * An alternative implementation of `Object.fromEntries`, which works in older
 * browsers.
 *
 * @param entries - The entries to convert to an object.
 * @returns The object.
 */
export const fromEntries = <Key extends string, Value>(
  entries: readonly (readonly [Key, Value])[],
): Record<Key, Value> => {
  return entries.reduce<Record<Key, Value>>(
    (acc, [key, value]) => ({ ...acc, [key]: value }),
    {} as Record<Key, Value>,
  );
};
