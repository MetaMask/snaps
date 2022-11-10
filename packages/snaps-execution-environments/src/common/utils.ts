/**
 * Takes an error that was thrown, determines if it is
 * an error object. If it is then it will return that. Otherwise,
 * an error object is created with the original error message.
 *
 * @param originalError - The error that was originally thrown.
 * @returns An error object.
 */
export function constructError(originalError: unknown) {
  let _originalError: Error | undefined;
  if (originalError instanceof Error) {
    _originalError = originalError;
  } else if (typeof originalError === 'string') {
    _originalError = new Error(originalError);
    // The stack is useless in this case.
    delete _originalError.stack;
  }
  return _originalError;
}

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

/**
 * Make proxy for Promise and handle the teardown process properly.
 * If the teardown is called in the meanwhile, Promise result will not be
 * exposed to the snap anymore and warning will be logged to the console.
 *
 * @param originalPromise - Original promise.
 * @param teardownRef - Reference containing teardown count.
 * @param teardownRef.lastTeardown - Number of the last teardown.
 * @returns New proxy promise.
 */
export function withTeardown<T>(
  originalPromise: Promise<T>,
  teardownRef: { lastTeardown: number },
): Promise<T> {
  const myTeardown = teardownRef.lastTeardown;
  return new Promise<T>((resolve, reject) => {
    originalPromise
      .then((value) => {
        if (teardownRef.lastTeardown === myTeardown) {
          resolve(value);
        } else {
          console.warn(
            'Late promise received after Snap finished execution. Promise will be dropped.',
          );
        }
      })
      .catch((reason) => {
        if (teardownRef.lastTeardown === myTeardown) {
          reject(reason);
        } else {
          console.warn(
            'Late promise received after Snap finished execution. Promise will be dropped.',
          );
        }
      });
  });
}
