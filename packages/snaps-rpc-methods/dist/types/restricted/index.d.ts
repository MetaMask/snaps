import type { DialogMethodHooks } from './dialog';
import type { GetBip32EntropyMethodHooks } from './getBip32Entropy';
import type { GetBip32PublicKeyMethodHooks } from './getBip32PublicKey';
import type { GetBip44EntropyMethodHooks } from './getBip44Entropy';
import type { GetEntropyHooks } from './getEntropy';
import type { GetLocaleMethodHooks } from './getLocale';
import type { InvokeSnapMethodHooks } from './invokeSnap';
import type { ManageAccountsMethodHooks } from './manageAccounts';
import type { ManageStateMethodHooks } from './manageState';
import type { NotifyMethodHooks } from './notify';
export { WALLET_SNAP_PERMISSION_KEY } from './invokeSnap';
export { getEncryptionEntropy } from './manageState';
export declare type RestrictedMethodHooks = DialogMethodHooks & GetBip32EntropyMethodHooks & GetBip32PublicKeyMethodHooks & GetBip44EntropyMethodHooks & GetEntropyHooks & InvokeSnapMethodHooks & ManageStateMethodHooks & NotifyMethodHooks & ManageAccountsMethodHooks & GetLocaleMethodHooks;
export declare const restrictedMethodPermissionBuilders: {
    readonly snap_dialog: Readonly<{
        readonly targetName: "snap_dialog";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: DialogMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_dialog";
            methodImplementation: (args: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").DialogParams>) => Promise<import("@metamask/utils").Json>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<DialogMethodHooks>;
    }>;
    readonly snap_getBip32Entropy: Readonly<{
        readonly targetName: "snap_getBip32Entropy";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            methodHooks: GetBip32EntropyMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_getBip32Entropy";
            methodImplementation: (args: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").Bip32Entropy>) => Promise<import("@metamask/key-tree").JsonSLIP10Node>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<GetBip32EntropyMethodHooks>;
    }>;
    readonly snap_getBip32PublicKey: Readonly<{
        readonly targetName: "snap_getBip32PublicKey";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            methodHooks: GetBip32PublicKeyMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_getBip32PublicKey";
            methodImplementation: (args: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").GetBip32PublicKeyParams>) => Promise<string>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<GetBip32PublicKeyMethodHooks>;
    }>;
    readonly snap_getBip44Entropy: Readonly<{
        readonly targetName: "snap_getBip44Entropy";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            methodHooks: GetBip44EntropyMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_getBip44Entropy";
            methodImplementation: (args: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").Bip44Entropy>) => Promise<import("@metamask/key-tree").JsonBIP44CoinTypeNode>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<GetBip44EntropyMethodHooks>;
    }>;
    readonly snap_getEntropy: Readonly<{
        readonly targetName: "snap_getEntropy";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: GetEntropyHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_getEntropy";
            methodImplementation: (options: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").GetEntropyParams>) => Promise<`0x${string}`>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<GetEntropyHooks>;
    }>;
    readonly wallet_snap: Readonly<{
        readonly targetName: "wallet_snap";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: InvokeSnapMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "wallet_snap";
            methodImplementation: (options: import("@metamask/permission-controller").RestrictedMethodOptions<import("./invokeSnap").InvokeSnapParams>) => Promise<import("@metamask/utils").Json>;
            allowedCaveats: readonly [string, ...string[]] | null;
            validator: import("@metamask/permission-controller").PermissionValidatorConstraint;
            sideEffect: {
                onPermitted: import("@metamask/permission-controller").SideEffectHandler<import("./invokeSnap").InstallSnaps | import("./invokeSnap").GetPermittedSnaps, never>;
            };
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<InvokeSnapMethodHooks>;
    }>;
    readonly snap_manageState: Readonly<{
        readonly targetName: "snap_manageState";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: ManageStateMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_manageState";
            methodImplementation: (options: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").ManageStateParams>) => Promise<import("@metamask/snaps-sdk").ManageStateResult>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<ManageStateMethodHooks>;
    }>;
    readonly snap_notify: Readonly<{
        readonly targetName: "snap_notify";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: NotifyMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_notify";
            methodImplementation: (args: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").NotifyParams>) => Promise<null>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<NotifyMethodHooks>;
    }>;
    readonly snap_manageAccounts: Readonly<{
        readonly targetName: "snap_manageAccounts";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: ManageAccountsMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_manageAccounts";
            methodImplementation: (options: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/snaps-sdk").ManageAccountsParams>) => Promise<import("@metamask/utils").Json>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: {
            readonly getSnapKeyring: true;
        };
    }>;
    readonly snap_getLocale: Readonly<{
        readonly targetName: "snap_getLocale";
        readonly specificationBuilder: import("@metamask/permission-controller").PermissionSpecificationBuilder<import("@metamask/permission-controller").PermissionType.RestrictedMethod, {
            allowedCaveats?: readonly [string, ...string[]] | null | undefined;
            methodHooks: GetLocaleMethodHooks;
        }, {
            permissionType: import("@metamask/permission-controller").PermissionType.RestrictedMethod;
            targetName: "snap_getLocale";
            methodImplementation: (_args: import("@metamask/permission-controller").RestrictedMethodOptions<import("@metamask/permission-controller").RestrictedMethodParameters>) => Promise<string>;
            allowedCaveats: readonly [string, ...string[]] | null;
        }>;
        readonly methodHooks: import("../utils").MethodHooksObject<GetLocaleMethodHooks>;
    }>;
};
export * from './caveats';
export type { DialogApprovalTypes } from './dialog';
export { DIALOG_APPROVAL_TYPES } from './dialog';
