/**
 * Get all properties of an object, including its prototype chain.
 *
 * @param obj - The object to get all properties for.
 * @returns All properties of `obj` as a tuple set, containing the property name
 * and value.
 */
export function allProperties(obj: any): Set<[object, string | symbol]> {
  const properties = new Set<[any, any]>();
  let current = obj;
  do {
    for (const key of Reflect.ownKeys(current)) {
      properties.add([current, key]);
    }
  } while (
    (current = Reflect.getPrototypeOf(current)) &&
    current !== Object.prototype
  );
  return properties;
}

/**
 * Get all functions of an object, including its prototype chain. This does not
 * include constructor functions.
 *
 * @param obj - The object to get all functions for.
 * @returns An array with all functions of `obj` as string or symbol.
 */
export function allFunctions(obj: any): (string | symbol)[] {
  const result = [];
  for (const [object, key] of allProperties(obj)) {
    if (key === 'constructor') {
      continue;
    }
    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor !== undefined && typeof descriptor.value === 'function') {
      result.push(key);
    }
  }
  return result;
}
