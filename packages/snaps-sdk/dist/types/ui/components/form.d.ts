import type { Infer } from '@metamask/superstruct';
import { NodeType } from '../nodes';
export declare const FormComponentStruct: import("@metamask/superstruct").Struct<{
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
} | {
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
}, null>;
/**
 * The subset of nodes allowed as children in the {@link Form} node.
 */
export declare type FormComponent = Infer<typeof FormComponentStruct>;
export declare const FormStruct: import("@metamask/superstruct").Struct<{
    type: NodeType.Form;
    name: string;
    children: ({
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
}, {
    type: import("@metamask/superstruct").Struct<NodeType.Form, NodeType.Form>;
    children: import("@metamask/superstruct").Struct<({
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[], import("@metamask/superstruct").Struct<{
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    }, null>>;
    name: import("@metamask/superstruct").Struct<string, null>;
}>;
/**
 * A form node that takes children {@link FormComponent} nodes and renders a form.
 *
 * @property type - The type of the node. Must be the string `form`.
 * @property children - The children of the node. Only {@link FormComponent} nodes are allowed.
 * @property name - The form name used to identify it.
 */
export declare type Form = Infer<typeof FormStruct>;
/**
 * Create a {@link Form} node.
 *
 * @param args - The node arguments. This can be either an array of children and a string, or
 * an object with a `name` and `children` property.
 * @param args.name - The form name used to identify it.
 * @param args.children - The child nodes of the form. This can be any valid
 * {@link FormComponent}.
 * @returns The form node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = form({
 *  name: 'myForm',
 *  children: [
 *    input({ name: 'myInput' }),
 *    button({ value: 'Hello, world!' }),
 *  ],
 * });
 *
 * const node = form('myForm', [input('myInput'), button('Hello, world!')]);
 */
export declare const form: (...args: [Omit<{
    type: NodeType.Form;
    name: string;
    children: ({
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
}, "type">] | (string | ({
    type: NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
} | {
    value: string;
    type: NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
})[])[]) => {
    type: NodeType.Form;
    name: string;
    children: ({
        type: NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
};
