import { assertStruct } from '@metamask/utils';
import { is, refine, string } from 'superstruct';

import type { Component } from './nodes';
import { ComponentStruct } from './nodes';

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

/**
 * Check if the given value is a valid URL on https or mailto protocol.
 *
 * @returns `true` if the value is a valid URL, the appropriate error message otherwise.
 */
export const url = () => {
  return refine(string(), 'url', (value) => {
    try {
      const validUrl = new URL(value);
      if (validUrl.protocol === 'https:' || validUrl.protocol === 'mailto:') {
        return true;
      }

      return 'The URL must start with `https:` or `mailto:`.';
    } catch {
      return 'The URL is invalid.';
    }
  });
};
