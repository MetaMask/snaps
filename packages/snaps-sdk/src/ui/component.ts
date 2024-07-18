import { is } from '@metamask/superstruct';
import { assertStruct } from '@metamask/utils';

import { ComponentStruct } from './components';
import type { Component } from './components';

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

/**
 * Assert that the given value is a {@link Component}. This performs recursive
 * validation of the component's children (if any).
 *
 * @param value - The value to check.
 * @throws If the value is not a {@link Component}.
 */
export function assertIsComponent(value: unknown): asserts value is Component {
  assertStruct(value, ComponentStruct, 'Invalid component');
}
