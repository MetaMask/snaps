import type { Infer } from 'superstruct';
import type { JSXElement } from '../jsx';
import type { Component } from '../ui';
/**
 * To avoid typing problems with the interface state when manipulating it we have to differentiate the state of
 * a form (that will be contained inside the root state) and the root state since a key in the root stat can contain
 * either the value of an input or a sub-state of a form.
 */
export declare const FormStateStruct: import("superstruct").Struct<Record<string, string | null>, null>;
export declare const InterfaceStateStruct: import("superstruct").Struct<Record<string, string | Record<string, string | null> | null>, null>;
export declare type FormState = Infer<typeof FormStateStruct>;
export declare type InterfaceState = Infer<typeof InterfaceStateStruct>;
export declare type ComponentOrElement = Component | JSXElement;
export declare const ComponentOrElementStruct: import("superstruct").Struct<JSXElement | {
    value: string;
    type: import("../ui").NodeType.Copyable;
    sensitive?: boolean | undefined;
} | {
    type: import("../ui").NodeType.Divider;
} | {
    value: string;
    type: import("../ui").NodeType.Heading;
} | {
    value: string;
    type: import("../ui").NodeType.Image;
} | import("../ui").Panel | {
    type: import("../ui").NodeType.Spinner;
} | {
    value: string;
    type: import("../ui").NodeType.Text;
    markdown?: boolean | undefined;
} | {
    value: `0x${string}`;
    type: import("../ui").NodeType.Address;
} | {
    value: {
        value: string;
        type: import("../ui").NodeType.Image;
    } | {
        value: string;
        type: import("../ui").NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: import("../ui").NodeType.Address;
    };
    type: import("../ui").NodeType.Row;
    label: string;
    variant?: "default" | "warning" | "critical" | undefined;
} | {
    type: import("../ui").NodeType.Input;
    name: string;
    value?: string | undefined;
    error?: string | undefined;
    placeholder?: string | undefined;
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
} | {
    value: string;
    type: import("../ui").NodeType.Button;
    name?: string | undefined;
    variant?: "primary" | "secondary" | undefined;
    buttonType?: "button" | "submit" | undefined;
} | {
    type: import("../ui").NodeType.Form;
    name: string;
    children: ({
        type: import("../ui").NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
    } | {
        value: string;
        type: import("../ui").NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
}, null>;
