import { rootRealmGlobal } from '../globalObject';

/**
 * Binds endowments to globalThis if needed.
 *
 * @param endowment - An endowment value.
 * @returns The endowment bound to globalThis if needed, otherwise returns as-is.
 */
export function bindEndowment(endowment: unknown) {
  return typeof endowment === 'function' && !isConstructor(endowment)
    ? endowment.bind(rootRealmGlobal)
    : endowment;
}

/**
 * Checks whether the specified function is a constructor.
 *
 * @param value - Any function value.
 * @returns Whether the specified function is a constructor.
 */
// `Function` is exactly what we want here.
// eslint-disable-next-line @typescript-eslint/ban-types
export function isConstructor<T extends Function>(value: T): boolean {
  // In our current usage, the string `prototype.constructor.name` should never
  // be empty, because you can't create a class with no name, and the
  // `prototype.constructor.name` property is configurable but not writable.
  // Nevertheless, that property was the empty string for `Date` in the iframe
  // execution environment during local testing. We have no idea why, but we
  // have to handle that case.
  // TODO: Does the `prototype` object always have a `constructor` property?
  return Boolean(typeof value.prototype?.constructor?.name === 'string');
}
