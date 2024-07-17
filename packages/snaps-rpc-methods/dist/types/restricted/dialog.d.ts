import type { PermissionSpecificationBuilder, RestrictedMethodOptions } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import { DialogType } from '@metamask/snaps-sdk';
import type { DialogParams, InterfaceState, SnapId, ComponentOrElement } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import type { Infer, Struct } from '@metamask/superstruct';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { type MethodHooksObject } from '../utils';
declare const methodName = "snap_dialog";
export declare type DialogApprovalTypes = Record<DialogType, string> & {
    default: string;
};
export declare const DIALOG_APPROVAL_TYPES: {
    alert: string;
    confirmation: string;
    prompt: string;
    default: string;
};
declare const PlaceholderStruct: Struct<string | undefined, null>;
export declare type Placeholder = Infer<typeof PlaceholderStruct>;
declare type RequestUserApprovalOptions = {
    id?: string;
    origin: string;
    type: string;
    requestData: {
        id: string;
        placeholder?: string;
    };
};
declare type RequestUserApproval = (opts: RequestUserApprovalOptions) => Promise<boolean | null | string | Json>;
declare type CreateInterface = (snapId: string, content: ComponentOrElement) => Promise<string>;
declare type GetInterface = (snapId: string, id: string) => {
    content: ComponentOrElement;
    snapId: SnapId;
    state: InterfaceState;
};
export declare type DialogMethodHooks = {
    /**
     * @param opts - The `requestUserApproval` options.
     * @param opts.id - The approval ID. If not provided, a new approval ID will be generated.
     * @param opts.origin - The origin of the request. In this case, the Snap ID.
     * @param opts.type - The type of the approval request.
     * @param opts.requestData - The data of the approval request.
     * @param opts.requestData.id - The ID of the interface.
     * @param opts.requestData.placeholder - The placeholder of the `Prompt` dialog.
     */
    requestUserApproval: RequestUserApproval;
    /**
     * @param snapId - The Snap ID creating the interface.
     * @param content - The content of the interface.
     */
    createInterface: CreateInterface;
    /**
     * @param snapId - The SnapId requesting the interface.
     * @param id - The interface ID.
     */
    getInterface: GetInterface;
};
declare type DialogSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: DialogMethodHooks;
};
export declare const dialogBuilder: Readonly<{
    readonly targetName: "snap_dialog";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, DialogSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof methodName;
        methodImplementation: ReturnType<typeof getDialogImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: MethodHooksObject<DialogMethodHooks>;
}>;
declare const DialogParametersStruct: Struct<{
    type: "alert";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
} | {
    type: "alert";
    id: string;
} | {
    type: "confirmation";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
} | {
    type: "confirmation";
    id: string;
} | {
    type: "prompt";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    placeholder?: string | undefined;
} | {
    type: "prompt";
    id: string;
    placeholder?: string | undefined;
} | {
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
} | {
    id: string;
}, [Struct<{
    type: "alert";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
} | {
    type: "alert";
    id: string;
}, [Struct<{
    type: "alert";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    type: Struct<"alert", null>;
    content: Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
}>, Struct<{
    type: "alert";
    id: string;
}, {
    type: Struct<"alert", null>;
    id: Struct<string, null>;
}>]>, Struct<{
    type: "confirmation";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
} | {
    type: "confirmation";
    id: string;
}, [Struct<{
    type: "confirmation";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    type: Struct<"confirmation", null>;
    content: Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
}>, Struct<{
    type: "confirmation";
    id: string;
}, {
    type: Struct<"confirmation", null>;
    id: Struct<string, null>;
}>]>, Struct<{
    type: "prompt";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    placeholder?: string | undefined;
} | {
    type: "prompt";
    id: string;
    placeholder?: string | undefined;
}, [Struct<{
    type: "prompt";
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    placeholder?: string | undefined;
}, {
    type: Struct<"prompt", null>;
    content: Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    placeholder: Struct<string | undefined, null>;
}>, Struct<{
    type: "prompt";
    id: string;
    placeholder?: string | undefined;
}, {
    type: Struct<"prompt", null>;
    id: Struct<string, null>;
    placeholder: Struct<string | undefined, null>;
}>]>, Struct<{
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
} | {
    id: string;
}, [Struct<{
    content: import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    content: Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
}>, Struct<{
    id: string;
}, {
    id: Struct<string, null>;
}>]>]>;
export declare type DialogParameters = InferMatching<typeof DialogParametersStruct, DialogParams>;
/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.requestUserApproval - A function that creates a new Approval in the ApprovalController.
 * This function should return a Promise that resolves with the appropriate value when the user has approved or rejected the request.
 * @param hooks.createInterface - A function that creates the interface in SnapInterfaceController.
 * @param hooks.getInterface - A function that gets an interface from SnapInterfaceController.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export declare function getDialogImplementation({ requestUserApproval, createInterface, getInterface, }: DialogMethodHooks): (args: RestrictedMethodOptions<DialogParameters>) => Promise<boolean | null | string | Json>;
export {};
