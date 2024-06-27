import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare enum ButtonVariant {
    Primary = "primary",
    Secondary = "secondary"
}
export declare enum ButtonType {
    Button = "button",
    Submit = "submit"
}
export declare const ButtonStruct: import("@metamask/superstruct").Struct<{
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Button, NodeType.Button>;
    value: import("@metamask/superstruct").Struct<string, null>;
    variant: import("@metamask/superstruct").Struct<"primary" | "secondary" | undefined, null>;
    buttonType: import("@metamask/superstruct").Struct<"button" | "submit" | undefined, null>;
    name: import("@metamask/superstruct").Struct<string | undefined, null>;
}>;
/**
 * A button node, that renders either a primary or a secondary button.
 *
 * @property type - The type of the node, must be the string 'button'.
 * @property variant - The style variant of the node, must be either 'primary' or 'secondary'.
 * @property value - The text content of the node as plain text.
 * @property buttonType - The type of the button, must be either 'button' or 'submit'.
 * @property name - An optional name to identify the button.
 */
export declare type Button = Infer<typeof ButtonStruct>;
/**
 * Create a {@link Button} node.
 *
 * @param args - The node arguments. This can be either a string, or an object
 * with a `value` property. A set of optional properties can be passed.
 * @param args.variant - The optional variant of the button.
 * @param args.value - The text content of the node.
 * @param args.name - The optional name of the button.
 * @returns The text node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * ```typescript
 * const node = button({  variant: 'primary', text: 'Hello, world!', name: 'myButton' });
 * const node = button('Hello, world!', 'button', 'myButton', 'primary');
 * const node = button('Hello, world!');
 * ```
 */
export declare const button: (...args: [Omit<{
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
}, "type">] | (string | undefined)[]) => {
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
};
