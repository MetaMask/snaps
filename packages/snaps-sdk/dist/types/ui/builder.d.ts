import type { Struct } from 'superstruct';
import type { Component } from './components';
import type { NodeType } from './nodes';
/**
 * A function that builds a {@link Component}. This infers the proper args type
 * from the given node.
 *
 * @internal
 */
declare type NodeBuilder<Node extends Component, Keys extends (keyof Node)[]> = Omit<Node, 'type'> extends Record<string, never> ? (...args: []) => Node : (...args: [Omit<Node, 'type'>] | NodeArrayType<Node, Keys>) => Node;
/**
 * Map from an array of node keys to the corresponding array type.
 *
 * @example
 * type Node = { type: 'node'; a: string; b: number; c: boolean };
 * type Keys = ['a', 'b', 'c'];
 *
 * type NodeArray = NodeArrayType<Node, Keys>; // [string, number, boolean]
 * @internal
 */
declare type NodeArrayType<Node extends Component, Keys extends (keyof Node)[]> = {
    [Key in keyof Keys]: Node[Keys[Key]];
};
/**
 * A function that returns a function to "build" a {@link Component}. It infers
 * the type of the component from the given struct, and performs validation on
 * the created component.
 *
 * The returned function can handle the node arguments in two ways:
 * 1. As a single object, with the keys corresponding to the node's properties,
 * excluding the `type` property.
 * 2. As an array of arguments, with the order corresponding to the given keys.
 *
 * @param type - The type of the component to build.
 * @param struct - The struct to use to validate the component.
 * @param keys - The keys of the component to use as arguments to the builder.
 * The order of the keys determines the order of the arguments.
 * @returns A function that builds a component of the given type.
 * @internal
 */
export declare function createBuilder<Node extends Component, Keys extends (keyof Node)[] = []>(type: NodeType, struct: Struct<Node>, keys?: Keys): NodeBuilder<Node, Keys>;
export {};
