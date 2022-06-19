/**
 * @param obj
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
 * @param obj
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
