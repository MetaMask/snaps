import type { OnCronjobHandler, OnHomePageHandler, OnKeyringRequestHandler, OnNameLookupHandler, OnRpcRequestHandler, OnSignatureHandler, OnTransactionHandler, OnUserInputHandler } from '@metamask/snaps-sdk';
import { SeverityLevel } from '@metamask/snaps-sdk';
import type { SnapHandler } from './handler-types';
import { HandlerType } from './handler-types';
export declare type SnapRpcHookArgs = {
    origin: string;
    handler: HandlerType;
    request: Record<string, unknown>;
};
export declare const SNAP_EXPORTS: {
    readonly onRpcRequest: {
        readonly type: HandlerType.OnRpcRequest;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnRpcRequestHandler<import("@metamask/snaps-sdk").JsonRpcParams>;
    };
    readonly onTransaction: {
        readonly type: HandlerType.OnTransaction;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnTransactionHandler;
    };
    readonly onCronjob: {
        readonly type: HandlerType.OnCronjob;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnCronjobHandler<import("@metamask/snaps-sdk").JsonRpcParams>;
    };
    readonly onNameLookup: {
        readonly type: HandlerType.OnNameLookup;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnNameLookupHandler;
    };
    readonly onInstall: {
        readonly type: HandlerType.OnInstall;
        readonly required: false;
        readonly validator: (snapExport: unknown) => snapExport is import("@metamask/snaps-sdk").LifecycleEventHandler;
    };
    readonly onUpdate: {
        readonly type: HandlerType.OnUpdate;
        readonly required: false;
        readonly validator: (snapExport: unknown) => snapExport is import("@metamask/snaps-sdk").LifecycleEventHandler;
    };
    readonly onKeyringRequest: {
        readonly type: HandlerType.OnKeyringRequest;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnKeyringRequestHandler<import("@metamask/snaps-sdk").JsonRpcParams>;
    };
    readonly onHomePage: {
        readonly type: HandlerType.OnHomePage;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnHomePageHandler;
    };
    readonly onSignature: {
        readonly type: HandlerType.OnSignature;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnSignatureHandler;
    };
    readonly onUserInput: {
        readonly type: HandlerType.OnUserInput;
        readonly required: false;
        readonly validator: (snapExport: unknown) => snapExport is OnUserInputHandler;
    };
};
export declare const OnTransactionSeverityResponseStruct: import("@metamask/superstruct").Struct<{
    severity?: SeverityLevel | undefined;
}, {
    severity: import("@metamask/superstruct").Struct<SeverityLevel | undefined, SeverityLevel>;
}>;
export declare const OnTransactionResponseWithIdStruct: import("@metamask/superstruct").Struct<{
    id: string;
    severity?: SeverityLevel | undefined;
}, {
    id: import("@metamask/superstruct").Struct<string, null>;
    severity: import("@metamask/superstruct").Struct<SeverityLevel | undefined, SeverityLevel>;
}>;
export declare const OnTransactionResponseWithContentStruct: import("@metamask/superstruct").Struct<{
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
    severity?: SeverityLevel | undefined;
}, {
    content: import("@metamask/superstruct").Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
    severity: import("@metamask/superstruct").Struct<SeverityLevel | undefined, SeverityLevel>;
}>;
export declare const OnTransactionResponseStruct: import("@metamask/superstruct").Struct<{
    id: string;
    severity?: SeverityLevel | undefined;
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
    severity?: SeverityLevel | undefined;
} | null, null>;
export declare const OnSignatureResponseStruct: import("@metamask/superstruct").Struct<{
    id: string;
    severity?: SeverityLevel | undefined;
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
    severity?: SeverityLevel | undefined;
} | null, null>;
export declare const OnHomePageResponseWithContentStruct: import("@metamask/superstruct").Struct<{
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
    content: import("@metamask/superstruct").Struct<import("@metamask/snaps-sdk").Panel | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ButtonProps, "Button"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CheckboxProps, "Checkbox"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FormProps, "Form"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").FileInputProps, "FileInput"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").InputProps, "Input"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").DropdownProps, "Dropdown"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoldProps, "Bold"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ItalicProps, "Italic"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").AddressProps, "Address"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").BoxProps, "Box"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CardProps, "Card"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").ContainerProps, "Container"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").CopyableProps, "Copyable"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Divider"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").LinkProps, "Link"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").RowProps, "Row"> | import("@metamask/snaps-sdk/jsx").SnapElement<Record<string, never>, "Spinner"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TextProps, "Text"> | import("@metamask/snaps-sdk/jsx").SnapElement<import("@metamask/snaps-sdk/jsx").TooltipProps, "Tooltip"> | {
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
export declare const OnHomePageResponseWithIdStruct: import("@metamask/superstruct").Struct<{
    id: string;
}, {
    id: import("@metamask/superstruct").Struct<string, null>;
}>;
export declare const OnHomePageResponseStruct: import("@metamask/superstruct").Struct<{
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
}, null>;
export declare const AddressResolutionStruct: import("@metamask/superstruct").Struct<{
    protocol: string;
    resolvedDomain: string;
}, {
    protocol: import("@metamask/superstruct").Struct<string, null>;
    resolvedDomain: import("@metamask/superstruct").Struct<string, null>;
}>;
export declare const DomainResolutionStruct: import("@metamask/superstruct").Struct<{
    protocol: string;
    resolvedAddress: string;
    domainName: string;
}, {
    protocol: import("@metamask/superstruct").Struct<string, null>;
    resolvedAddress: import("@metamask/superstruct").Struct<string, null>;
    domainName: import("@metamask/superstruct").Struct<string, null>;
}>;
export declare const AddressResolutionResponseStruct: import("@metamask/superstruct").Struct<{
    resolvedDomains: {
        protocol: string;
        resolvedDomain: string;
    }[];
}, {
    resolvedDomains: import("@metamask/superstruct").Struct<{
        protocol: string;
        resolvedDomain: string;
    }[], import("@metamask/superstruct").Struct<{
        protocol: string;
        resolvedDomain: string;
    }, {
        protocol: import("@metamask/superstruct").Struct<string, null>;
        resolvedDomain: import("@metamask/superstruct").Struct<string, null>;
    }>>;
}>;
export declare const DomainResolutionResponseStruct: import("@metamask/superstruct").Struct<{
    resolvedAddresses: {
        protocol: string;
        resolvedAddress: string;
        domainName: string;
    }[];
}, {
    resolvedAddresses: import("@metamask/superstruct").Struct<{
        protocol: string;
        resolvedAddress: string;
        domainName: string;
    }[], import("@metamask/superstruct").Struct<{
        protocol: string;
        resolvedAddress: string;
        domainName: string;
    }, {
        protocol: import("@metamask/superstruct").Struct<string, null>;
        resolvedAddress: import("@metamask/superstruct").Struct<string, null>;
        domainName: import("@metamask/superstruct").Struct<string, null>;
    }>>;
}>;
export declare const OnNameLookupResponseStruct: import("@metamask/superstruct").Struct<{
    resolvedDomains: {
        protocol: string;
        resolvedDomain: string;
    }[];
} | {
    resolvedAddresses: {
        protocol: string;
        resolvedAddress: string;
        domainName: string;
    }[];
} | null, null>;
/**
 * Utility type for getting the handler function type from a handler type.
 */
export declare type HandlerFunction<Type extends SnapHandler> = Type['validator'] extends (snapExport: unknown) => snapExport is infer Handler ? Handler : never;
/**
 * All the function-based handlers that a snap can implement.
 */
export declare type SnapFunctionExports = {
    [Key in keyof typeof SNAP_EXPORTS]?: HandlerFunction<(typeof SNAP_EXPORTS)[Key]>;
};
/**
 * All handlers that a snap can implement.
 */
export declare type SnapExports = SnapFunctionExports;
