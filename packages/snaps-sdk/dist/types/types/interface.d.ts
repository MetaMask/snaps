import type { Infer } from '@metamask/superstruct';
import type { JSXElement } from '../jsx';
import type { Component } from '../ui';
/**
 * To avoid typing problems with the interface state when manipulating it we
 * have to differentiate the state of a form (that will be contained inside the
 * root state) and the root state since a key in the root stat can contain
 * either the value of an input or a sub-state of a form.
 */
export declare const StateStruct: import("@metamask/superstruct").Struct<string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
}, null>;
export declare const FormStateStruct: import("@metamask/superstruct").Struct<Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | null>, null>;
export declare const InterfaceStateStruct: import("@metamask/superstruct").Struct<Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | null> | null>, null>;
export declare type State = Infer<typeof StateStruct>;
export declare type FormState = Infer<typeof FormStateStruct>;
export declare type InterfaceState = Infer<typeof InterfaceStateStruct>;
export declare type ComponentOrElement = Component | JSXElement;
export declare const ComponentOrElementStruct: import("@metamask/superstruct").Struct<{
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
    label?: string | undefined;
    inputType?: "number" | "text" | "password" | undefined;
    placeholder?: string | undefined;
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
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: import("../ui").NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    })[];
} | import("../jsx").SnapElement<import("../jsx").ButtonProps, "Button"> | import("../jsx").SnapElement<import("../jsx").CheckboxProps, "Checkbox"> | import("../jsx").SnapElement<import("../jsx").FormProps, "Form"> | import("../jsx").SnapElement<import("../jsx").InputProps, "Input"> | import("../jsx").SnapElement<import("../jsx").DropdownProps, "Dropdown"> | import("../jsx").SnapElement<import("../jsx").FileInputProps, "FileInput"> | import("../jsx").SnapElement<import("../jsx").BoldProps, "Bold"> | import("../jsx").SnapElement<import("../jsx").ItalicProps, "Italic"> | import("../jsx").SnapElement<import("../jsx").AddressProps, "Address"> | import("../jsx").SnapElement<import("../jsx").BoxProps, "Box"> | import("../jsx").SnapElement<import("../jsx").CopyableProps, "Copyable"> | import("../jsx").SnapElement<Record<string, never>, "Divider"> | import("../jsx").SnapElement<{
    children: import("../jsx").StringElement;
}, "Heading"> | import("../jsx").SnapElement<{
    src: string;
    alt?: string | undefined;
}, "Image"> | import("../jsx").SnapElement<import("../jsx").LinkProps, "Link"> | import("../jsx").SnapElement<import("../jsx").TextProps, "Text"> | import("../jsx").SnapElement<import("../jsx").RowProps, "Row"> | import("../jsx").SnapElement<Record<string, never>, "Spinner"> | import("../jsx").SnapElement<import("../jsx").TooltipProps, "Tooltip">, null>;
export declare const InterfaceContextStruct: import("@metamask/superstruct").Struct<Record<string, import("@metamask/utils").Json>, null>;
export declare type InterfaceContext = Infer<typeof InterfaceContextStruct>;
