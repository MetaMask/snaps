import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { CreateInterfaceParams, CreateInterfaceResult, ComponentOrElement, InterfaceContext } from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
export declare type CreateInterfaceMethodHooks = {
    /**
     * @param ui - The UI components.
     * @returns The unique identifier of the interface.
     */
    createInterface: (ui: ComponentOrElement, context?: InterfaceContext) => Promise<string>;
};
export declare const createInterfaceHandler: PermittedHandlerExport<CreateInterfaceMethodHooks, CreateInterfaceParameters, CreateInterfaceResult>;
declare const CreateInterfaceParametersStruct: import("@metamask/superstruct").Struct<{
    ui: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Copyable;
        sensitive?: boolean | undefined;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Divider;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Heading;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Image;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Spinner;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: import("@metamask/snaps-sdk").NodeType.Address;
    } | {
        value: {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Image;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Text;
            markdown?: boolean | undefined;
        } | {
            value: `0x${string}`;
            type: import("@metamask/snaps-sdk").NodeType.Address;
        };
        type: import("@metamask/snaps-sdk").NodeType.Row;
        label: string;
        variant?: "default" | "warning" | "critical" | undefined;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Form;
        name: string;
        children: ({
            type: import("@metamask/snaps-sdk").NodeType.Input;
            name: string;
            value?: string | undefined;
            error?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
            placeholder?: string | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    } | import("@metamask/snaps-sdk/jsx").SnapElement<{
        children: import("@metamask/snaps-sdk/jsx").StringElement;
    }, "Heading"> | import("@metamask/snaps-sdk/jsx").SnapElement<{
        src: string;
        alt?: string | undefined;
    }, "Image">;
    context?: Record<string, import("@metamask/snaps-sdk").Json> | undefined;
}, {
    ui: import("@metamask/superstruct").Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Copyable;
        sensitive?: boolean | undefined;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Divider;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Heading;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Image;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Spinner;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Text;
        markdown?: boolean | undefined;
    } | {
        value: `0x${string}`;
        type: import("@metamask/snaps-sdk").NodeType.Address;
    } | {
        value: {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Image;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Text;
            markdown?: boolean | undefined;
        } | {
            value: `0x${string}`;
            type: import("@metamask/snaps-sdk").NodeType.Address;
        };
        type: import("@metamask/snaps-sdk").NodeType.Row;
        label: string;
        variant?: "default" | "warning" | "critical" | undefined;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Input;
        name: string;
        value?: string | undefined;
        error?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
        placeholder?: string | undefined;
    } | {
        value: string;
        type: import("@metamask/snaps-sdk").NodeType.Button;
        name?: string | undefined;
        variant?: "primary" | "secondary" | undefined;
        buttonType?: "button" | "submit" | undefined;
    } | {
        type: import("@metamask/snaps-sdk").NodeType.Form;
        name: string;
        children: ({
            type: import("@metamask/snaps-sdk").NodeType.Input;
            name: string;
            value?: string | undefined;
            error?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
            placeholder?: string | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    } | import("@metamask/snaps-sdk/jsx").SnapElement<{
        children: import("@metamask/snaps-sdk/jsx").StringElement;
    }, "Heading"> | import("@metamask/snaps-sdk/jsx").SnapElement<{
        src: string;
        alt?: string | undefined;
    }, "Image">, null>;
    context: import("@metamask/superstruct").Struct<Record<string, import("@metamask/snaps-sdk").Json> | undefined, null>;
}>;
export declare type CreateInterfaceParameters = InferMatching<typeof CreateInterfaceParametersStruct, CreateInterfaceParams>;
export {};
