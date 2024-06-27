import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
/**
 * This replicates the available input types from the metamask extension.
 * https://github.com/MetaMask/metamask-extension/develop/ui/components/component-library/input/input.constants.js
 */
export declare enum InputType {
    Text = "text",
    Number = "number",
    Password = "password"
}
export declare const InputStruct: import("@metamask/superstruct").Struct<{
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Input, NodeType.Input>;
    value: import("@metamask/superstruct").Struct<string | undefined, null>;
    name: import("@metamask/superstruct").Struct<string, null>;
    inputType: import("@metamask/superstruct").Struct<"number" | "text" | "password" | undefined, null>;
    placeholder: import("@metamask/superstruct").Struct<string | undefined, null>;
    label: import("@metamask/superstruct").Struct<string | undefined, null>;
    error: import("@metamask/superstruct").Struct<string | undefined, null>;
}>;
/**
 * An input node, that renders an input.
 *
 * @property type - The type of the node, must be the string 'input'.
 * @property name - The name for the input.
 * @property value - The value of the input.
 * @property inputType - An optional type, either `text`, `password` or `number`.
 * @property placeholder - An optional input placeholder.
 * @property label - An optional input label.
 * @property error - An optional error text.
 */
export declare type Input = Infer<typeof InputStruct>;
/**
 * Create a {@link Input} node.
 *
 * @param args - The node arguments. This can either be a name and an optional variant, value and placeholder or an object
 * with the properties: `inputType`, `value`, `variant`, `placeholder` and `name`.
 * @param args.name - The name for the input.
 * @param args.value - The value of the input.
 * @param args.inputType - An optional type, either `text`, `password` or `number`.
 * @param args.placeholder - An optional input placeholder.
 * @param args.label - An optional input label.
 * @param args.error - An optional error text.
 * @returns The input node as an object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = input('myInput');
 * const node = input('myInput', InputType.Text, 'my placeholder', 'myValue', 'myLabel');
 * const node = input({ name: 'myInput' });
 * const node = input({name: 'myInput', value: 'myValue', inputType: InputType.Password, placeholder: 'placeholder'})
 */
export declare const input: (...args: (string | undefined)[] | [Omit<{
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
}, "type">]) => {
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
};
