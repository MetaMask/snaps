import { PermissionSpecificationBuilder, PermissionType, RestrictedMethodOptions } from '@metamask/controllers';
import { NonEmptyArray } from '@metamask/utils';
declare const methodName = "snap_confirm";
declare type ConfirmFields = {
    /**
     * A prompt, phrased as a question, no greater than 40 characters long.
     */
    title: string;
    /**
     * A description, displayed with the prompt, no greater than 140 characters
     * long.
     */
    description?: string;
    /**
     * Free-from text content, no greater than 1800 characters long.
     */
    textAreaContent?: string;
};
/**
 * For backwards compatibility.
 */
declare type LegacyConfirmFields = Omit<ConfirmFields, 'title'> & {
    /**
     * A prompt, phrased as a question, no greater than 40 characters long.
     */
    prompt: string;
};
/**
 * @deprecated Use `snap_dialog` instead.
 */
export declare type ConfirmMethodHooks = {
    /**
     * @param snapId - The ID of the Snap that created the confirmation.
     * @param fields - The confirmation text field contents.
     * @returns Whether the user accepted or rejected the confirmation.
     */
    showConfirmation: (snapId: string, fields: ConfirmFields) => Promise<boolean>;
};
declare type ConfirmSpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: ConfirmMethodHooks;
};
/**
 * @deprecated Use `snap_dialog` instead.
 */
export declare const confirmBuilder: Readonly<{
    readonly targetKey: "snap_confirm";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, ConfirmSpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof methodName;
        methodImplementation: ReturnType<typeof getConfirmImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: {
        readonly showConfirmation: true;
    };
}>;
/**
 * Builds the method implementation for `snap_confirm`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showConfirmation - A function that shows a confirmation in the MetaMask UI and returns a `boolean` that signals whether the user approved or denied the confirmation.
 * @returns The method implementation which returns `true` if the user approved the confirmation, otherwise `false`.
 */
declare function getConfirmImplementation({ showConfirmation }: ConfirmMethodHooks): (args: RestrictedMethodOptions<[LegacyConfirmFields]>) => Promise<boolean>;
export {};
