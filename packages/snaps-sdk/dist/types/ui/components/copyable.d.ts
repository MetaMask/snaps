import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare const CopyableStruct: import("@metamask/superstruct").Struct<{
    value: string;
    type: NodeType.Copyable;
    sensitive?: boolean | undefined;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Copyable, NodeType.Copyable>;
    value: import("@metamask/superstruct").Struct<string, null>;
    sensitive: import("@metamask/superstruct").Struct<boolean | undefined, null>;
}>;
/**
 * Text that can be copied to the clipboard. It can optionally be marked as
 * sensitive, in which case it will only be displayed to the user after clicking
 * on the component.
 *
 * @property type - The type of the node. Must be the string `copyable`.
 * @property value - The text to be copied.
 * @property sensitive - Whether the value is sensitive or not. Sensitive values
 * are only displayed to the user after clicking on the component. Defaults to
 * false.
 */
export declare type Copyable = Infer<typeof CopyableStruct>;
/**
 * Create a {@link Copyable} component.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `text` property.
 * @param args.value - The text to be copied.
 * @param args.sensitive - Whether the value is sensitive or not. Sensitive
 * values are only displayed to the user after clicking on the component.
 * Defaults to false.
 * @returns A {@link Copyable} component.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = copyable('Hello, world!');
 * const node = copyable({ value: 'Hello, world!' });
 */
export declare const copyable: (...args: [Omit<{
    value: string;
    type: NodeType.Copyable;
    sensitive?: boolean | undefined;
}, "type">] | (string | boolean | undefined)[]) => {
    value: string;
    type: NodeType.Copyable;
    sensitive?: boolean | undefined;
};
