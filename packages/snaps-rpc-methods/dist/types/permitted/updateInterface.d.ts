import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { UpdateInterfaceParams, UpdateInterfaceResult, ComponentOrElement } from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
export declare type UpdateInterfaceMethodHooks = {
    /**
     * @param id - The interface ID.
     * @param ui - The UI components.
     */
    updateInterface: (id: string, ui: ComponentOrElement) => Promise<void>;
};
export declare const updateInterfaceHandler: PermittedHandlerExport<UpdateInterfaceMethodHooks, UpdateInterfaceParameters, UpdateInterfaceResult>;
declare const UpdateInterfaceParametersStruct: import("@metamask/superstruct").Struct<{
    id: string;
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
}, {
    id: import("@metamask/superstruct").Struct<string, null>;
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
}>;
export declare type UpdateInterfaceParameters = InferMatching<typeof UpdateInterfaceParametersStruct, UpdateInterfaceParams>;
export {};
