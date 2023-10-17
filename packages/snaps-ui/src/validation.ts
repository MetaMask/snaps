import { assert, assertStruct } from '@metamask/utils';
import { is, refine, string } from 'superstruct';

import type { Component } from './nodes';
import { ComponentStruct, NodeType } from './nodes';

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
 * Test if a given string is a valid URL.
 *
 * @param value - The value to test.
 * @returns True if it is, ortherwise false.
 */
export function isValidUrl(value: string) {
  try {
    const validUrl = new URL(value);
    if (validUrl.protocol === 'https:' || validUrl.protocol === 'mailto:') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if the given value is a valid URL on https or mailto protocol.
 *
 * @returns `true` if the value is a valid URL, the appropriate error message otherwise.
 */
export const url = () => {
  return refine(string(), 'url', (value) => {
    if (isValidUrl(value)) {
      return true;
    }

    return 'The URL is invalid.';
  });
};

const LINK_REGEX = /(?<protocol>[a-z]+:\/\/)?(?<host>\S+?(?:\.\S+)+)/giu;

/**
 * Searches for {@link Links} components and checks that the URL they are trying to
 * pass in not in the phishing list.
 *
 * @param component - The custom UI component.
 * @param isOnPhishingList - The function that checks the link against the phishing list.
 */
export async function assertLinksAreSafe(
  component: Component,
  isOnPhishingList: (url: string) => Promise<boolean>,
) {
  const { type } = component;
  if (type === NodeType.Panel) {
    for (const node of component.children) {
      await assertLinksAreSafe(node, isOnPhishingList);
    }
  }

  if (component.type === NodeType.Link) {
    assert(
      !(await isOnPhishingList(component.url)),
      'The provided URL is detected as phishing.',
    );
  }

  if (component.type === NodeType.Text) {
    const links = component.value.match(LINK_REGEX);

    if (links) {
      for (const link of links) {
        assert(
          !(await isOnPhishingList(link)),
          'The provided URL is detected as phishing.',
        );
      }
    }
  }
}
