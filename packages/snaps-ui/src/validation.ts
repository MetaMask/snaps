import { is } from 'superstruct';

import { Component, ComponentStruct } from './nodes';

/**
 * Check if the given value is a {@link Component}. This performs recursive
 * validation of the component's children (if any).
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link Component}, `false` otherwise.
 */
export function isComponent(value: unknown): value is Component {
  return is(value, ComponentStruct);
}
