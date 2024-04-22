import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { hasProperty, isPlainObject } from '@metamask/utils';

/**
 * Walk a JSX tree and call a callback on each node.
 *
 * @param node - The JSX node to walk.
 * @param callback - The callback to call on each node.
 */
export function walkJsx(
  node: JSXElement,
  callback: (node: JSXElement) => void,
) {
  callback(node);

  if (
    hasProperty(node, 'props') &&
    isPlainObject(node.props) &&
    hasProperty(node.props, 'children')
  ) {
    if (Array.isArray(node.props.children)) {
      node.props.children.forEach((child) => {
        if (isPlainObject(child)) {
          walkJsx(child as JSXElement, callback);
        }
      });
    }

    if (isPlainObject(node.props.children)) {
      walkJsx(node.props.children as JSXElement, callback);
    }
  }
}
