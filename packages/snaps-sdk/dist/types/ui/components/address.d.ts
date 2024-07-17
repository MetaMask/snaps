import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare const AddressStruct: import("@metamask/superstruct").Struct<{
    value: `0x${string}`;
    type: NodeType.Address;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Address, NodeType.Address>;
    value: import("@metamask/superstruct").Struct<`0x${string}`, null>;
}>;
/**
 * A address node, that renders an EVM-like address and its icon.
 *
 * @property type - The type of the node. Must be the string `address`.
 * @property value - The address in hexadecimal, including 0x.
 */
export declare type Address = Infer<typeof AddressStruct>;
/**
 * Create an {@link Address} node.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `value` property.
 * @param args.value - The address to be rendered.
 * @returns The address node as an object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = address({ value: '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520' });
 * const node = address('0x4bbeeb066ed09b7aed07bf39eee0460dfa261520');
 */
export declare const address: (...args: `0x${string}`[] | [Omit<{
    value: `0x${string}`;
    type: NodeType.Address;
}, "type">]) => {
    value: `0x${string}`;
    type: NodeType.Address;
};
