import { PermissionConstraint } from '@metamask/controllers';
import { Json } from '@metamask/utils';
import { ConfirmMethodHooks } from './confirm';
import { DialogMethodHooks } from './dialog';
import { GetBip44EntropyMethodHooks } from './getBip44Entropy';
import { InvokeSnapMethodHooks } from './invokeSnap';
import { ManageStateMethodHooks } from './manageState';
import { NotifyMethodHooks } from './notify';
import { GetBip32EntropyMethodHooks } from './getBip32Entropy';
import { GetBip32PublicKeyMethodHooks } from './getBip32PublicKey';
export { AlertFields, ConfirmationFields, DialogFields, DialogParameters, DialogType, PromptFields, } from './dialog';
export { ManageStateOperation } from './manageState';
export { NotificationArgs, NotificationType } from './notify';
export declare type RestrictedMethodHooks = ConfirmMethodHooks & DialogMethodHooks & GetBip32EntropyMethodHooks & GetBip32PublicKeyMethodHooks & GetBip44EntropyMethodHooks & InvokeSnapMethodHooks & ManageStateMethodHooks & NotifyMethodHooks;
export declare const restrictedMethodPermissionBuilders: {
    readonly snap_confirm: Readonly<{
        readonly targetKey: "snap_confirm";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: ConfirmMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_confirm";
            methodImplementation: (args: import("@metamask/controllers").RestrictedMethodOptions<[Omit<{
                title: string;
                description?: string | undefined;
                textAreaContent?: string | undefined;
            }, "title"> & {
                prompt: string;
            }]>) => Promise<boolean>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: {
            readonly showConfirmation: true;
        };
    }>;
    readonly snap_dialog: Readonly<{
        readonly targetKey: "snap_dialog";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: DialogMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_dialog";
            methodImplementation: (args: import("@metamask/controllers").RestrictedMethodOptions<{
                type: import("./dialog").DialogType.Alert;
                fields: {
                    title: string;
                    description?: string | undefined;
                    textAreaContent?: string | undefined;
                };
            } | {
                type: import("./dialog").DialogType.Confirmation;
                fields: {
                    title: string;
                    description?: string | undefined;
                    textAreaContent?: string | undefined;
                };
            } | {
                type: import("./dialog").DialogType.Prompt;
                fields: {
                    title: string;
                    description?: string | undefined;
                };
            }>) => Promise<string | boolean | null>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: {
            readonly showDialog: true;
        };
    }>;
    readonly snap_getBip32Entropy: Readonly<{
        readonly targetKey: "snap_getBip32Entropy";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            methodHooks: GetBip32EntropyMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_getBip32Entropy";
            methodImplementation: (args: import("@metamask/controllers").RestrictedMethodOptions<{
                path: ["m", ...(`${number}` | `${number}'`)[]];
                curve: "ed25519" | "secp256k1";
            }>) => Promise<import("@metamask/key-tree").JsonSLIP10Node>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/controllers").PermissionValidatorConstraint;
        }>;
        readonly methodHooks: {
            readonly getMnemonic: true;
            readonly getUnlockPromise: true;
        };
    }>;
    readonly snap_getBip32PublicKey: Readonly<{
        readonly targetKey: "snap_getBip32PublicKey";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            methodHooks: GetBip32PublicKeyMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_getBip32PublicKey";
            methodImplementation: (args: import("@metamask/controllers").RestrictedMethodOptions<{
                path: ["m", ...(`${number}` | `${number}'`)[]];
                curve: "ed25519" | "secp256k1";
                compressed?: boolean | undefined;
            }>) => Promise<string>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/controllers").PermissionValidatorConstraint;
        }>;
        readonly methodHooks: {
            readonly getMnemonic: true;
            readonly getUnlockPromise: true;
        };
    }>;
    readonly snap_getBip44Entropy: Readonly<{
        readonly targetKey: "snap_getBip44Entropy";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            methodHooks: GetBip44EntropyMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_getBip44Entropy";
            methodImplementation: (args: import("@metamask/controllers").RestrictedMethodOptions<{
                coinType: number;
            }>) => Promise<import("@metamask/key-tree").JsonBIP44CoinTypeNode>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/controllers").PermissionValidatorConstraint;
        }>;
        readonly methodHooks: {
            readonly getMnemonic: true;
            readonly getUnlockPromise: true;
        };
    }>;
    readonly "wallet_snap_*": Readonly<{
        readonly targetKey: "wallet_snap_*";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: InvokeSnapMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "wallet_snap_*";
            methodImplementation: (options: import("@metamask/controllers").RestrictedMethodOptions<[Record<string, Json>]>) => Promise<Json>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: {
            readonly getSnap: true;
            readonly handleSnapRpcRequest: true;
        };
    }>;
    readonly snap_manageState: Readonly<{
        readonly targetKey: "snap_manageState";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: ManageStateMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_manageState";
            methodImplementation: (options: import("@metamask/controllers").RestrictedMethodOptions<[import("./manageState").ManageStateOperation, Record<string, Json>]>) => Promise<Record<string, Json> | null>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: {
            readonly clearSnapState: true;
            readonly getSnapState: true;
            readonly updateSnapState: true;
        };
    }>;
    readonly snap_notify: Readonly<{
        readonly targetKey: "snap_notify";
        readonly specificationBuilder: import("@metamask/controllers").PermissionSpecificationBuilder<import("@metamask/controllers").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: NotifyMethodHooks;
        }, {
            permissionType: import("@metamask/controllers").PermissionType.RestrictedMethod;
            targetKey: "snap_notify";
            methodImplementation: (args: import("@metamask/controllers").RestrictedMethodOptions<[import("./notify").NotificationArgs]>) => Promise<null>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: {
            readonly showNativeNotification: true;
            readonly showInAppNotification: true;
        };
    }>;
};
export declare const caveatSpecifications: {
    readonly permittedCoinTypes: import("@metamask/controllers").RestrictedMethodCaveatSpecificationConstraint;
    readonly permittedDerivationPaths: import("@metamask/controllers").RestrictedMethodCaveatSpecificationConstraint;
};
export declare const caveatMappers: Record<string, (value: Json) => Pick<PermissionConstraint, 'caveats'>>;
