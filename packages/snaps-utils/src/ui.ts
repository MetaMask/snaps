import type {
  Component,
  NodeWithChildren,
  SnapInterface,
} from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { isJSXElementUnsafe } from '@metamask/snaps-sdk/jsx';
import { assert, AssertionError, hasProperty } from '@metamask/utils';
import type { Tokens } from 'marked';
import { lexer, walkTokens } from 'marked';

import { walkJsx } from './jsx';

const ALLOWED_PROTOCOLS = ['https:', 'mailto:'];

/**
 * Extract all links from a Markdown text string using the `marked` lexer.
 *
 * @param text - The markdown text string.
 * @returns A list of URLs linked to in the string.
 */
function getMarkdownLinks(text: string) {
  const tokens = lexer(text, { gfm: false });
  const links: (Tokens.Link | Tokens.Generic)[] = [];

  // Walk the lexed tokens and collect all link tokens
  walkTokens(tokens, (token) => {
    if (token.type === 'link') {
      links.push(token);
    }
  });

  return links.map((link) => link?.href).filter(Boolean);
}

/**
 * Validate a link against the phishing list.
 *
 * @param link - The link to validate.
 * @param isOnPhishingList - The function that checks the link against the
 * phishing list.
 */
function validateLink(
  link: string,
  isOnPhishingList: (url: string) => boolean,
) {
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
        error instanceof AssertionError ? error.message : 'Unable to parse URL.'
      }`,
    );
  }
}

/**
 * Search for Markdown links in a string and checks them against the phishing
 * list.
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
  const links = getMarkdownLinks(text);

  for (const link of links) {
    validateLink(link, isOnPhishingList);
  }
}

/**
 * Walk a JSX tree and validate each {@link LinkElement} node against the
 * phishing list.
 *
 * @param node - The JSX node to walk.
 * @param isOnPhishingList - The function that checks the link against the
 * phishing list.
 */
function validateJsxLinks(
  node: JSXElement,
  isOnPhishingList: (url: string) => boolean,
) {
  walkJsx(node, (childNode) => {
    if (childNode.type !== 'link') {
      return;
    }

    validateLink(childNode.props.href, isOnPhishingList);
  });
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
  component: SnapInterface,
  isOnPhishingList: (url: string) => boolean,
) {
  if (isJSXElementUnsafe(component)) {
    validateJsxLinks(component, isOnPhishingList);
    return;
  }

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

/**
 * Check if a component has children.
 *
 * @param component - A custom UI component.
 * @returns `true` if the component has children, `false` otherwise.
 */
export function hasChildren(
  component: Component,
): component is NodeWithChildren {
  return hasProperty(component, 'children');
}
