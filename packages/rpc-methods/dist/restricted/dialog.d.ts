import { PermissionSpecificationBuilder, PermissionType, RestrictedMethodOptions } from '@metamask/controllers';
import { NonEmptyArray } from '@metamask/utils';
import { Infer, Struct } from 'superstruct';
declare const methodName = "snap_dialog";
export declare enum DialogType {
    Alert = "Alert",
    Confirmation = "Confirmation",
    Prompt = "Prompt"
}
declare const BaseFieldsStruct: Struct<{
    title: string;
    description?: string | undefined;
    textAreaContent?: string | undefined;
}, {
    title: Struct<string, null>;
    description: Struct<string | undefined, null>;
    textAreaContent: Struct<string | undefined, null>;
}>;
declare const PromptFieldsStruct: Struct<{
    title: string;
    description?: string | undefined;
}, Omit<{
    title: Struct<string, null>;
    description: Struct<string | undefined, null>;
    textAreaContent: Struct<string | undefined, null>;
}, "textAreaContent">>;
/**
 * @property title - The alert title, no greater than 40 characters long.
 * @property description - A description, displayed with the title, no greater
 * than 140 characters long.
 * @property textAreaContent - Free-from text content, no greater than 1800
 * characters long.
 */
export declare type AlertFields = Infer<typeof BaseFieldsStruct>;
/**
 * @property title - A question describing what the user is confirming, no
 * greater than 40 characters long.
 * @property description - A description, displayed with the question, no
 * greater than 140 characters long.
 * @property textAreaContent - Free-from text content, no greater than 1800
 * characters long.
 */
export declare type ConfirmationFields = Infer<typeof BaseFieldsStruct>;
/**
 * @property title - The prompt title, no greater than 40 characters long.
 * @property description - A description, displayed with the prompt, no greater
 * than 140 characters long.
 */
export declare type PromptFields = Infer<typeof PromptFieldsStruct>;
export declare type DialogFields = AlertFields | ConfirmationFields | PromptFields;
declare type ShowDialog = (snapId: string, type: DialogType, fields: DialogFields) => Promise<null | boolean | string>;
export declare type DialogMethodHooks = {
    /**
     * @param snapId - The ID of the Snap that created the alert.
     * @param type - The dialog type.
     * @param fields - The dialog fields.
     */
    showDialog: ShowDialog;
};
declare type DialogSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: DialogMethodHooks;
};
export declare const dialogBuilder: Readonly<{
    readonly targetKey: "snap_dialog";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, DialogSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof methodName;
        methodImplementation: ReturnType<typeof getDialogImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: {
        readonly showDialog: true;
    };
}>;
declare const DialogParametersStruct: Struct<{
    type: DialogType.Alert;
    fields: {
        title: string;
        description?: string | undefined;
        textAreaContent?: string | undefined;
    };
} | {
    type: DialogType.Confirmation;
    fields: {
        title: string;
        description?: string | undefined;
        textAreaContent?: string | undefined;
    };
} | {
    type: DialogType.Prompt;
    fields: {
        title: string;
        description?: string | undefined;
    };
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
