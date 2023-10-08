import type { PermissionSpecificationBuilder, RestrictedMethodOptions } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { Component } from '@metamask/snaps-ui';
import type { EnumToUnion } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import type { Infer, Struct } from 'superstruct';
import type { MethodHooksObject } from '../utils';
declare const methodName = "snap_dialog";
export declare enum DialogType {
    Alert = "alert",
    Confirmation = "confirmation",
    Prompt = "prompt"
}
declare const PlaceholderStruct: Struct<string | undefined, null>;
export declare type Placeholder = Infer<typeof PlaceholderStruct>;
declare type ShowDialog = (snapId: string, type: EnumToUnion<DialogType>, content: Component, placeholder?: Placeholder) => Promise<null | boolean | string>;
export declare type DialogMethodHooks = {
    /**
     * @param snapId - The ID of the Snap that created the alert.
     * @param type - The dialog type.
     * @param content - The dialog custom UI.
     * @param placeholder - The placeholder for the Prompt dialog input.
     */
    showDialog: ShowDialog;
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
    content: import("@metamask/snaps-ui").Panel | {
        type: import("@metamask/snaps-ui").NodeType.Copyable;
        value: string;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Divider;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Heading;
        value: string;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Spinner;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Text;
        value: string;
        markdown?: boolean | undefined;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Image;
        value: string;
    };
} | {
    type: "confirmation";
    content: import("@metamask/snaps-ui").Panel | {
        type: import("@metamask/snaps-ui").NodeType.Copyable;
        value: string;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Divider;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Heading;
        value: string;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Spinner;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Text;
        value: string;
        markdown?: boolean | undefined;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Image;
        value: string;
    };
} | {
    type: "prompt";
    content: import("@metamask/snaps-ui").Panel | {
        type: import("@metamask/snaps-ui").NodeType.Copyable;
        value: string;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Divider;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Heading;
        value: string;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Spinner;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Text;
        value: string;
        markdown?: boolean | undefined;
    } | {
        type: import("@metamask/snaps-ui").NodeType.Image;
        value: string;
    };
    placeholder?: string | undefined;
}, null>;
export declare type DialogParameters = Infer<typeof DialogParametersStruct>;
/**
 * Builds the method implementation for `snap_dialog`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showDialog - A function that shows the specified dialog in the
 * MetaMask UI and returns the appropriate value for the dialog type.
 * @returns The method implementation which return value depends on the dialog
 * type, valid return types are: string, boolean, null.
 */
export declare function getDialogImplementation({ showDialog }: DialogMethodHooks): (args: RestrictedMethodOptions<DialogParameters>) => Promise<boolean | null | string>;
export {};
