import type { Component } from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import { assert, AssertionError } from '@metamask/utils';

const MARKDOWN_LINK_REGEX = /\[(?<name>[^\]]*)\]\((?<url>[^)]+)\)/giu;

const ALLOWED_PROTOCOLS = ['https:', 'mailto:'];

/**
 * Searches for markdown links in a string and checks them against the phishing list.
 *
 * @param text - The text to verify.
 * @param isOnPhishingList - The function that checks the link against the
 * phishing list.
 * @throws If the text contains a link that is not allowed.
 */
export function validateTextLinks(
  text: string,
  isOnPhishingList: (url: string) => boolean,
) {
  const matches = String.prototype.matchAll.call(text, MARKDOWN_LINK_REGEX);

  for (const { groups } of matches) {
    const link = groups?.url;

    /* This case should never happen with the regex but the TS type allows for undefined */
    /* istanbul ignore next */
    if (!link) {
      continue;
    }

    try {
      const url = new URL(link);
      assert(
        ALLOWED_PROTOCOLS.includes(url.protocol),
        `Protocol must be one of: ${ALLOWED_PROTOCOLS.join(', ')}.`,
      );

      const hostname =
        url.protocol === 'mailto:' ? url.pathname.split('@')[1] : url.hostname;

      assert(!isOnPhishingList(hostname), 'The specified URL is not allowed.');
    } catch (error) {
      throw new Error(
        `Invalid URL: ${
          error instanceof AssertionError
            ? error.message
            : 'Unable to parse URL.'
        }`,
      );
    }
  }
}

/**
 * Search for links in UI components and check that the URL they are trying to
 * pass in is not in the phishing list.
 *
 * @param component - The custom UI component.
 * @param isOnPhishingList - The function that checks the link against the
 * phishing list.
 * @throws If the component contains a link that is not allowed.
 */
export function validateComponentLinks(
  component: Component,
  isOnPhishingList: (url: string) => boolean,
) {
  const { type } = component;
  switch (type) {
    case NodeType.Panel:
      component.children.forEach((node) =>
        validateComponentLinks(node, isOnPhishingList),
      );
      break;
    case NodeType.Row:
      validateComponentLinks(component.value, isOnPhishingList);
      break;
    case NodeType.Text:
      validateTextLinks(component.value, isOnPhishingList);
      break;
    default:
      break;
  }
}

/**
 * Calculate the total length of all text in the component.
 *
 * @param component - A custom UI component.
 * @returns The total length of all text components in the component.
 */
export function getTotalTextLength(component: Component): number {
  const { type } = component;

  switch (type) {
    case NodeType.Panel:
      return component.children.reduce<number>(
        // This is a bug in TypeScript: https://github.com/microsoft/TypeScript/issues/48313
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        (sum, node) => sum + getTotalTextLength(node),
        0,
      );
    case NodeType.Row:
      return getTotalTextLength(component.value);
    case NodeType.Text:
      return component.value.length;
    default:
      return 0;
  }
}
