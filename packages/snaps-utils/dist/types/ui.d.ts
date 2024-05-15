import type { Component } from '@metamask/snaps-sdk';
import type { JSXElement, LinkElement, MaybeArray, StandardFormattingElement } from '@metamask/snaps-sdk/jsx';
/**
 * Get all text children from a markdown string.
 *
 * @param value - The markdown string.
 * @returns The text children.
 */
export declare function getTextChildren(value: string): (string | StandardFormattingElement | LinkElement)[];
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
export declare function getJsxElementFromComponent(legacyComponent: Component): JSXElement;
/**
 * Search for Markdown links in a string and checks them against the phishing
 * list.
 *
 * @param text - The text to verify.
 * @param isOnPhishingList - The function that checks the link against the
 * phishing list.
 * @throws If the text contains a link that is not allowed.
 */
export declare function validateTextLinks(text: string, isOnPhishingList: (url: string) => boolean): void;
/**
 * Walk a JSX tree and validate each {@link LinkElement} node against the
 * phishing list.
 *
 * @param node - The JSX node to walk.
 * @param isOnPhishingList - The function that checks the link against the
 * phishing list.
 */
export declare function validateJsxLinks(node: JSXElement, isOnPhishingList: (url: string) => boolean): void;
/**
 * Calculate the total length of all text in the component.
 *
 * @param component - A custom UI component.
 * @returns The total length of all text components in the component.
 */
export declare function getTotalTextLength(component: Component): number;
/**
 * Check if a JSX element has children.
 *
 * @param element - A JSX element.
 * @returns `true` if the element has children, `false` otherwise.
 */
export declare function hasChildren<Element extends JSXElement>(element: Element): element is Element & {
    props: {
        children: MaybeArray<JSXElement | string>;
    };
};
/**
 * Get the children of a JSX element as an array. If the element has only one
 * child, the child is returned as an array.
 *
 * @param element - A JSX element.
 * @returns The children of the element.
 */
export declare function getJsxChildren(element: JSXElement): (JSXElement | string)[];
/**
 * Walk a JSX tree and call a callback on each node.
 *
 * @param node - The JSX node to walk.
 * @param callback - The callback to call on each node.
 * @returns The result of the callback, if any.
 */
export declare function walkJsx<Value>(node: JSXElement | JSXElement[], callback: (node: JSXElement) => Value | undefined): Value | undefined;
