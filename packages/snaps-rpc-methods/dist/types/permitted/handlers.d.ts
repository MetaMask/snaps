export declare const methodHandlers: {
    wallet_getAllSnaps: import("@metamask/permission-controller").PermittedHandlerExport<import("./getAllSnaps").GetAllSnapsHooks, import("@metamask/utils").JsonRpcParams, import("@metamask/snaps-sdk").GetSnapsResult>;
    wallet_getSnaps: import("@metamask/permission-controller").PermittedHandlerExport<import("./getSnaps").GetSnapsHooks, import("@metamask/utils").JsonRpcParams, import("@metamask/snaps-sdk").GetSnapsResult>;
    wallet_requestSnaps: import("@metamask/permission-controller").PermittedHandlerExport<import("./requestSnaps").RequestSnapsHooks, import("@metamask/snaps-sdk").RequestSnapsParams, import("@metamask/snaps-sdk").RequestSnapsResult>;
    wallet_invokeSnap: import("@metamask/permission-controller").PermittedHandlerExport<import("./invokeSnapSugar").InvokeSnapSugarHooks, import("@metamask/snaps-sdk").InvokeSnapParams, import("@metamask/utils").Json>;
    wallet_invokeKeyring: import("@metamask/permission-controller").PermittedHandlerExport<import("./invokeKeyring").InvokeKeyringHooks, import("@metamask/snaps-sdk").InvokeSnapParams, import("@metamask/utils").Json>;
    snap_getClientStatus: import("@metamask/permission-controller").PermittedHandlerExport<import("./getClientStatus").GetClientStatusHooks, import("@metamask/utils").JsonRpcParams, import("@metamask/snaps-sdk").GetClientStatusResult>;
    snap_getFile: import("@metamask/permission-controller").PermittedHandlerExport<import("./getFile").GetFileHooks, import("@metamask/snaps-sdk").GetFileParams, string>;
    snap_createInterface: import("@metamask/permission-controller").PermittedHandlerExport<import("./createInterface").CreateInterfaceMethodHooks, import("@metamask/snaps-sdk").CreateInterfaceParams, string>;
    snap_updateInterface: import("@metamask/permission-controller").PermittedHandlerExport<import("./updateInterface").UpdateInterfaceMethodHooks, import("@metamask/snaps-sdk").UpdateInterfaceParams, null>;
    snap_getInterfaceState: import("@metamask/permission-controller").PermittedHandlerExport<import("./getInterfaceState").GetInterfaceStateMethodHooks, import("@metamask/snaps-sdk").GetInterfaceStateParams, Record<string, string | boolean | {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | Record<string, string | boolean | {
        name: string;
        size: number;
        contentType: string;
        contents: string;
    } | null> | null>>;
    snap_resolveInterface: import("@metamask/permission-controller").PermittedHandlerExport<import("./resolveInterface").ResolveInterfaceMethodHooks, import("@metamask/snaps-sdk").ResolveInterfaceParams, null>;
};
export declare const handlers: (import("@metamask/permission-controller").PermittedHandlerExport<import("./createInterface").CreateInterfaceMethodHooks, import("@metamask/snaps-sdk").CreateInterfaceParams, string> | import("@metamask/permission-controller").PermittedHandlerExport<import("./getAllSnaps").GetAllSnapsHooks, import("@metamask/utils").JsonRpcParams, import("@metamask/snaps-sdk").GetSnapsResult> | import("@metamask/permission-controller").PermittedHandlerExport<import("./getClientStatus").GetClientStatusHooks, import("@metamask/utils").JsonRpcParams, import("@metamask/snaps-sdk").GetClientStatusResult> | import("@metamask/permission-controller").PermittedHandlerExport<import("./getInterfaceState").GetInterfaceStateMethodHooks, import("@metamask/snaps-sdk").GetInterfaceStateParams, Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | null> | null>> | import("@metamask/permission-controller").PermittedHandlerExport<import("./getSnaps").GetSnapsHooks, import("@metamask/utils").JsonRpcParams, import("@metamask/snaps-sdk").GetSnapsResult> | import("@metamask/permission-controller").PermittedHandlerExport<import("./requestSnaps").RequestSnapsHooks, import("@metamask/snaps-sdk").RequestSnapsParams, import("@metamask/snaps-sdk").RequestSnapsResult> | import("@metamask/permission-controller").PermittedHandlerExport<import("./resolveInterface").ResolveInterfaceMethodHooks, import("@metamask/snaps-sdk").ResolveInterfaceParams, null> | import("@metamask/permission-controller").PermittedHandlerExport<import("./updateInterface").UpdateInterfaceMethodHooks, import("@metamask/snaps-sdk").UpdateInterfaceParams, null> | import("@metamask/permission-controller").PermittedHandlerExport<import("./getFile").GetFileHooks, import("@metamask/snaps-sdk").GetFileParams, string> | import("@metamask/permission-controller").PermittedHandlerExport<import("./invokeSnapSugar").InvokeSnapSugarHooks, import("@metamask/snaps-sdk").InvokeSnapParams, import("@metamask/utils").Json> | import("@metamask/permission-controller").PermittedHandlerExport<import("./invokeKeyring").InvokeKeyringHooks, import("@metamask/snaps-sdk").InvokeSnapParams, import("@metamask/utils").Json>)[];
