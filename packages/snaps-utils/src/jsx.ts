import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { hasProperty, isPlainObject } from '@metamask/utils';

/**
 * Walk a JSX tree and call a callback on each node.
 *
 * @param node - The JSX node to walk.
 * @param callback - The callback to call on each node.
 * @returns The result of the callback, if any.
 */
export function walkJsx<Value>(
  node: JSXElement,
  callback: (node: JSXElement) => Value | undefined,
): Value | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const childResult = walkJsx(child as JSXElement, callback);
      if (childResult !== undefined) {
        return childResult;
      }
    }

    return undefined;
  }

  const result = callback(node);
  if (result !== undefined) {
    return result;
  }

  if (
    hasProperty(node, 'props') &&
    isPlainObject(node.props) &&
    hasProperty(node.props, 'children')
  ) {
    if (Array.isArray(node.props.children)) {
      for (const child of node.props.children) {
        if (isPlainObject(child)) {
          const childResult = walkJsx(child as JSXElement, callback);
          if (childResult !== undefined) {
            return childResult;
          }
        }
      }
    }

    if (isPlainObject(node.props.children)) {
      return walkJsx(node.props.children as JSXElement, callback);
    }
  }

  return undefined;
}
