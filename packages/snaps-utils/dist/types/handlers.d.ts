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
export declare const OnTransactionSeverityResponseStruct: import("superstruct").Struct<{
    severity?: SeverityLevel | undefined;
}, {
    severity: import("superstruct").Struct<SeverityLevel | undefined, SeverityLevel>;
}>;
export declare const OnTransactionResponseWithIdStruct: import("superstruct").Struct<{
    id: string;
    severity?: SeverityLevel | undefined;
}, {
    id: import("superstruct").Struct<string, null>;
    severity: import("superstruct").Struct<SeverityLevel | undefined, SeverityLevel>;
}>;
export declare const OnTransactionResponseWithContentStruct: import("superstruct").Struct<{
    content: import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    };
    severity?: SeverityLevel | undefined;
}, {
    content: import("superstruct").Struct<import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    }, null>;
    severity: import("superstruct").Struct<SeverityLevel | undefined, SeverityLevel>;
}>;
export declare const OnTransactionResponseStruct: import("superstruct").Struct<{
    id: string;
    severity?: SeverityLevel | undefined;
} | {
    content: import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    };
    severity?: SeverityLevel | undefined;
} | null, null>;
export declare const OnSignatureResponseStruct: import("superstruct").Struct<{
    id: string;
    severity?: SeverityLevel | undefined;
} | {
    content: import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    };
    severity?: SeverityLevel | undefined;
} | null, null>;
export declare const OnHomePageResponseWithContentStruct: import("superstruct").Struct<{
    content: import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    };
}, {
    content: import("superstruct").Struct<import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    }, null>;
}>;
export declare const OnHomePageResponseWithIdStruct: import("superstruct").Struct<{
    id: string;
}, {
    id: import("superstruct").Struct<string, null>;
}>;
export declare const OnHomePageResponseStruct: import("superstruct").Struct<{
    content: import("@metamask/snaps-sdk/jsx-runtime").JSXElement | import("@metamask/snaps-sdk").Panel | {
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
        placeholder?: string | undefined;
        label?: string | undefined;
        inputType?: "number" | "text" | "password" | undefined;
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
            placeholder?: string | undefined;
            label?: string | undefined;
            inputType?: "number" | "text" | "password" | undefined;
        } | {
            value: string;
            type: import("@metamask/snaps-sdk").NodeType.Button;
            name?: string | undefined;
            variant?: "primary" | "secondary" | undefined;
            buttonType?: "button" | "submit" | undefined;
        })[];
    };
} | {
    id: string;
}, null>;
export declare const AddressResolutionStruct: import("superstruct").Struct<{
    protocol: string;
    resolvedDomain: string;
}, {
    protocol: import("superstruct").Struct<string, null>;
    resolvedDomain: import("superstruct").Struct<string, null>;
}>;
export declare const DomainResolutionStruct: import("superstruct").Struct<{
    protocol: string;
    resolvedAddress: string;
}, {
    protocol: import("superstruct").Struct<string, null>;
    resolvedAddress: import("superstruct").Struct<string, null>;
}>;
export declare const AddressResolutionResponseStruct: import("superstruct").Struct<{
    resolvedDomains: {
        protocol: string;
        resolvedDomain: string;
    }[];
}, {
    resolvedDomains: import("superstruct").Struct<{
        protocol: string;
        resolvedDomain: string;
    }[], import("superstruct").Struct<{
        protocol: string;
        resolvedDomain: string;
    }, {
        protocol: import("superstruct").Struct<string, null>;
        resolvedDomain: import("superstruct").Struct<string, null>;
    }>>;
}>;
export declare const DomainResolutionResponseStruct: import("superstruct").Struct<{
    resolvedAddresses: {
        protocol: string;
        resolvedAddress: string;
    }[];
}, {
    resolvedAddresses: import("superstruct").Struct<{
        protocol: string;
        resolvedAddress: string;
    }[], import("superstruct").Struct<{
        protocol: string;
        resolvedAddress: string;
    }, {
        protocol: import("superstruct").Struct<string, null>;
        resolvedAddress: import("superstruct").Struct<string, null>;
    }>>;
}>;
export declare const OnNameLookupResponseStruct: import("superstruct").Struct<{
    resolvedDomains: {
        protocol: string;
        resolvedDomain: string;
    }[];
} | {
    resolvedAddresses: {
        protocol: string;
        resolvedAddress: string;
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
