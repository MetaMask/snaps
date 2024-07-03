// TODO: Move to `snaps-sdk`?

import type { JSXElement, Nestable } from '@metamask/snaps-sdk/jsx';
import { hasProperty, isPlainObject } from '@metamask/utils';

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

  if (hasChildren(node)) {
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
 * Get the footer element from the JSX element tree.
 *
 * @param element - The JSX element to search for the footer.
 * @returns The footer element.
 */
export function getFooter(element: JSXElement) {
  // eslint-disable-next-line consistent-return
  const footer = walkJsx(element, (node) => {
    if (node.type === 'Footer') {
      return node;
    }
  });

  return footer;
}
