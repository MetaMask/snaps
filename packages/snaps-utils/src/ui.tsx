import type { Component } from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import type {
  BoldChildren,
  GenericSnapElement,
  ItalicChildren,
  JSXElement,
  LinkElement,
  Nestable,
  RowChildren,
  SnapNode,
  StandardFormattingElement,
  TextChildren,
} from '@metamask/snaps-sdk/jsx';
import {
  Italic,
  Link,
  Bold,
  Row,
  Text,
  Field,
  Image,
  Input,
  Heading,
  Form,
  Divider,
  Spinner,
  Copyable,
  Box,
  Button,
  Address,
} from '@metamask/snaps-sdk/jsx';
import {
  assert,
  assertExhaustive,
  AssertionError,
  hasProperty,
  isPlainObject,
} from '@metamask/utils';
import { lexer, walkTokens } from 'marked';
import type { Token, Tokens } from 'marked';

const MAX_TEXT_LENGTH = 50_000; // 50 kb
const ALLOWED_PROTOCOLS = ['https:', 'mailto:'];

/**
 * Get the button variant from a legacy button component variant.
 *
 * @param variant - The legacy button component variant.
 * @returns The button variant.
 */
function getButtonVariant(variant?: 'primary' | 'secondary' | undefined) {
  switch (variant) {
    case 'primary':
      return 'primary';
    case 'secondary':
      return 'destructive';
    default:
      return undefined;
  }
}

/**
 * Get the children of a JSX element. If there is only one child, the child is
 * returned directly. Otherwise, the children are returned as an array.
 *
 * @param elements - The JSX elements.
 * @returns The child or children.
 */
function getChildren<Type>(elements: Type[]) {
  if (elements.length === 1) {
    return elements[0];
  }

  return elements;
}

/**
 * Get the text of a link token.
 *
 * @param token - The link token.
 * @returns The text of the link token.
 */
function getLinkText(token: Tokens.Link | Tokens.Generic) {
  if (token.tokens && token.tokens.length > 0) {
    return getChildren(token.tokens.flatMap(getTextChildFromToken));
  }

  return token.href;
}

/**
 * Get the text child from a list of markdown tokens.
 *
 * @param tokens - The markdown tokens.
 * @returns The text child.
 */
function getTextChildFromTokens(tokens: Token[]) {
  return getChildren(tokens.flatMap(getTextChildFromToken));
}

/**
 * Get the text child from a markdown token.
 *
 * @param token - The markdown token.
 * @returns The text child.
 */
function getTextChildFromToken(token: Token): TextChildren {
  switch (token.type) {
    case 'link': {
      return <Link href={token.href} children={getLinkText(token)} />;
    }

    case 'text':
      return token.text;

    case 'strong':
      return (
        <Bold>
          {
            getTextChildFromTokens(
              // Due to the way `marked` is typed, `token.tokens` can be
              // `undefined`, but it's a required field of `Tokens.Bold`, so we
              // can safely cast it to `Token[]`.
              token.tokens as Token[],
            ) as BoldChildren
          }
        </Bold>
      );

    case 'em':
      return (
        <Italic>
          {
            getTextChildFromTokens(
              // Due to the way `marked` is typed, `token.tokens` can be
              // `undefined`, but it's a required field of `Tokens.Bold`, so we
              // can safely cast it to `Token[]`.
              token.tokens as Token[],
            ) as ItalicChildren
          }
        </Italic>
      );

    default:
      return null;
  }
}

/**
 * Get all text children from a markdown string.
 *
 * @param value - The markdown string.
 * @returns The text children.
 */
export function getTextChildren(
  value: string,
): (string | StandardFormattingElement | LinkElement)[] {
  const rootTokens = lexer(value, { gfm: false });
  const children: (string | StandardFormattingElement | LinkElement | null)[] =
    [];

  walkTokens(rootTokens, (token) => {
    if (token.type === 'paragraph') {
      if (children.length > 0) {
        children.push('\n\n');
      }

      const { tokens } = token as Tokens.Paragraph;
      // We do not need to consider nesting deeper than 1 level here and we can therefore cast.
      children.push(
        ...(tokens.flatMap(getTextChildFromToken) as (
          | string
          | StandardFormattingElement
          | LinkElement
          | null
        )[]),
      );
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return children.filter((child) => child !== null) as (
    | string
    | StandardFormattingElement
    | LinkElement
  )[];
}

/**
 * Validate the text size of a component. The text size is the total length of
 * all text in the component.
 *
 * @param component - The component to validate.
 * @throws An error if the text size exceeds the maximum allowed size.
 */
function validateComponentTextSize(component: Component) {
  const textSize = getTotalTextLength(component);
  assert(
    textSize <= MAX_TEXT_LENGTH,
    `The text in a Snap UI may not be larger than ${
      MAX_TEXT_LENGTH / 1000
    } kB.`,
  );
}

/**
 * Get a JSX element from a legacy UI component. This supports all legacy UI
 * components, and maps them to their JSX equivalents where possible.
 *
 * This function validates the text size of the component, but does not validate
 * the total size. The total size of the component should be validated before
 * calling this function.
 *
 * @param legacyComponent - The legacy UI component.
 * @returns The JSX element.
 */
export function getJsxElementFromComponent(
  legacyComponent: Component,
): JSXElement {
  validateComponentTextSize(legacyComponent);

  /**
   * Get the JSX element for a component. This function is recursive and will
   * call itself for child components.
   *
   * @param component - The component to convert to a JSX element.
   * @returns The JSX element.
   */
  function getElement(component: Component) {
    switch (component.type) {
      case NodeType.Address:
        return <Address address={component.value} />;

      case NodeType.Button:
        return (
          <Button
            name={component.name}
            variant={getButtonVariant(component.variant)}
            type={component.buttonType}
          >
            {component.value}
          </Button>
        );

      case NodeType.Copyable:
        return (
          <Copyable value={component.value} sensitive={component.sensitive} />
        );

      case NodeType.Divider:
        return <Divider />;

      case NodeType.Form:
        return (
          <Form name={component.name}>
            {getChildren(component.children.map(getElement))}
          </Form>
        );

      case NodeType.Heading:
        return <Heading children={component.value} />;

      case NodeType.Image:
        // `Image` supports `alt`, but the legacy `Image` component does not.
        return <Image src={component.value} />;

      case NodeType.Input:
        return (
          <Field label={component.label} error={component.error}>
            <Input
              name={component.name}
              type={component.inputType}
              value={component.value}
              placeholder={component.placeholder}
            />
          </Field>
        );

      case NodeType.Panel:
        // `Panel` is renamed to `Box` in JSX.
        return (
          <Box children={getChildren(component.children.map(getElement))} />
        );

      case NodeType.Row:
        return (
          <Row label={component.label} variant={component.variant}>
            {getElement(component.value) as RowChildren}
          </Row>
        );

      case NodeType.Spinner:
        return <Spinner />;

      case NodeType.Text:
        return <Text>{getChildren(getTextChildren(component.value))}</Text>;

      /* istanbul ignore next 2 */
      default:
        return assertExhaustive(component);
    }
  }

  return getElement(legacyComponent);
}

/**
 * Extract all links from a Markdown text string using the `marked` lexer.
 *
 * @param text - The markdown text string.
 * @returns A list of URLs linked to in the string.
 */
function getMarkdownLinks(text: string) {
  const tokens = lexer(text, { gfm: false });
  const links: Tokens.Link[] = [];

  // Walk the lexed tokens and collect all link tokens
  walkTokens(tokens, (token) => {
    if (token.type === 'link') {
      links.push(token as Tokens.Link);
    }
  });

  return links;
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
    validateLink(link.href, isOnPhishingList);
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
export function validateJsxLinks(
  node: JSXElement,
  isOnPhishingList: (url: string) => boolean,
) {
  walkJsx(node, (childNode) => {
    if (childNode.type !== 'Link') {
      return;
    }

    validateLink(childNode.props.href, isOnPhishingList);
  });
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
 * Check if a JSX element has children.
 *
 * @param element - A JSX element.
 * @returns `true` if the element has children, `false` otherwise.
 */
export function hasChildren<Element extends JSXElement>(
  element: Element,
): element is Element & {
  props: { children: Nestable<JSXElement | string> };
} {
  return hasProperty(element.props, 'children');
}

/**
 * Filter a JSX child to remove `null`, `undefined`, plain booleans, and empty
 * strings.
 *
 * @param child - The JSX child to filter.
 * @returns `true` if the child is not `null`, `undefined`, a plain boolean, or
 * an empty string, `false` otherwise.
 */
function filterJsxChild(child: JSXElement | string | boolean | null): boolean {
  return Boolean(child) && child !== true;
}

/**
 * Get the children of a JSX element as an array. If the element has only one
 * child, the child is returned as an array.
 *
 * @param element - A JSX element.
 * @returns The children of the element.
 */
export function getJsxChildren(element: JSXElement): (JSXElement | string)[] {
  if (hasChildren(element)) {
    if (Array.isArray(element.props.children)) {
      // @ts-expect-error - Each member of the union type has signatures, but
      // none of those signatures are compatible with each other.
      return element.props.children.filter(filterJsxChild).flat(Infinity);
    }

    if (element.props.children) {
      return [element.props.children];
    }
  }

  return [];
}

/**
 * Walk a JSX tree and call a callback on each node.
 *
 * @param node - The JSX node to walk.
 * @param callback - The callback to call on each node.
 * @param depth - The current depth in the JSX tree for a walk.
 * @returns The result of the callback, if any.
 */
export function walkJsx<Value>(
  node: JSXElement | JSXElement[],
  callback: (node: JSXElement, depth: number) => Value | undefined,
  depth = 0,
): Value | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const childResult = walkJsx(child as JSXElement, callback, depth);
      if (childResult !== undefined) {
        return childResult;
      }
    }

    return undefined;
  }

  const result = callback(node, depth);
  if (result !== undefined) {
    return result;
  }

  if (
    hasProperty(node, 'props') &&
    isPlainObject(node.props) &&
    hasProperty(node.props, 'children')
  ) {
    const children = getJsxChildren(node);
    for (const child of children) {
      if (isPlainObject(child)) {
        const childResult = walkJsx(child, callback, depth + 1);
        if (childResult !== undefined) {
          return childResult;
        }
      }
    }
  }

  return undefined;
}

/**
 * Serialise a JSX prop to a string.
 *
 * @param prop - The JSX prop.
 * @returns The serialised JSX prop.
 */
function serialiseProp(prop: unknown): string {
  if (typeof prop === 'string') {
    return `"${prop}"`;
  }

  return `{${JSON.stringify(prop)}}`;
}

/**
 * Serialise JSX props to a string.
 *
 * @param props - The JSX props.
 * @returns The serialised JSX props.
 */
function serialiseProps(props: Record<string, unknown>): string {
  return Object.entries(props)
    .filter(([key]) => key !== 'children')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => ` ${key}=${serialiseProp(value)}`)
    .join('');
}

/**
 * Serialise a JSX node to a string.
 *
 * @param node - The JSX node.
 * @param indentation - The indentation level. Defaults to `0`. This should not
 * be set by the caller, as it is used for recursion.
 * @returns The serialised JSX node.
 */
export function serialiseJsx(node: SnapNode, indentation = 0): string {
  if (Array.isArray(node)) {
    return node.map((child) => serialiseJsx(child, indentation)).join('');
  }

  const indent = '  '.repeat(indentation);
  if (typeof node === 'string') {
    return `${indent}${node}\n`;
  }

  if (!node) {
    return '';
  }

  const { type, props } = node as GenericSnapElement;
  const trailingNewline = indentation > 0 ? '\n' : '';

  if (hasProperty(props, 'children')) {
    const children = serialiseJsx(props.children as SnapNode, indentation + 1);
    return `${indent}<${type}${serialiseProps(
      props,
    )}>\n${children}${indent}</${type}>${trailingNewline}`;
  }

  return `${indent}<${type}${serialiseProps(props)} />${trailingNewline}`;
}
