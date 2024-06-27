import { type BoxElement, type JSXElement } from '@metamask/snaps-sdk/jsx';
import type { NodeModel } from '@minoru/react-dnd-treeview';
/**
 * Get the text of a node model.
 *
 * @param nodeModel - The node model.
 * @returns The text of the node model, or `null` if the node model does not
 * have text.
 */
export declare function getNodeText(nodeModel: NodeModel<JSXElement>): string | null;
/**
 * Verify that the node is a valid box children.
 *
 * @param child - The node to verify.
 * @returns True if the node is a valid box children, otherwise false.
 */
export declare function isValidBoxChild(child: JSXElement): boolean;
/**
 * Verify that the node is a valid form children.
 *
 * @param child - The node to verify.
 * @returns True if the node is a valid form children, otherwise false.
 */
export declare function isValidFormChild(child: JSXElement): boolean;
/**
 * Verify that the node is a valid field children.
 *
 * @param child - The node to verify.
 * @returns True if the node is a valid field children, otherwise false.
 */
export declare function isValidFieldChild(child: JSXElement): boolean;
/**
 * Set the children of an element.
 *
 * @param parent - The parent element.
 * @param child - The child element.
 * @param validator - The validator function.
 * @returns The children of the parent element.
 */
export declare function setElementChildren(parent: JSXElement, child: JSXElement, validator: (child: JSXElement) => boolean): JSXElement | (string | JSXElement)[];
/**
 * Convert an array of node models to a component. This is useful for converting
 * the tree view data to a component that can be rendered.
 *
 * @param nodeModels - The array of node models.
 * @returns The component.
 */
export declare function nodeModelsToComponent(nodeModels: NodeModel<JSXElement>[]): BoxElement;
/**
 * Convert a root Box to code. The code is formatted using prettier.
 *
 * @param component - The root panel.
 * @returns The code.
 */
export declare function boxToCode(component: BoxElement): string;
/**
 * Verify that an element can be dropped into a parent element.
 *
 * @param parent - The parent element.
 * @param element - The element to drop.
 * @returns True if the element can be dropped, otherwise false.
 */
export declare function canDropElement(parent?: JSXElement, element?: JSXElement): boolean;
