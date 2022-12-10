import { EnableWalletHooks } from './enable';
import { GetAppKeyHooks } from './getAppKey';
import { GetSnapsHooks } from './getSnaps';
import { InstallSnapsHooks } from './installSnaps';
export declare type PermittedRpcMethodHooks = EnableWalletHooks & GetAppKeyHooks & GetSnapsHooks & InstallSnapsHooks;
export declare const handlers: (import("@metamask/types").PermittedHandlerExport<EnableWalletHooks, [import("@metamask/controllers").RequestedPermissions], import("./enable").EnableWalletResult> | import("@metamask/types").PermittedHandlerExport<GetAppKeyHooks, [string], string> | import("@metamask/types").PermittedHandlerExport<GetSnapsHooks, void, import("@metamask/snap-utils/*").InstallSnapsResult> | import("@metamask/types").PermittedHandlerExport<InstallSnapsHooks, [import("@metamask/controllers").RequestedPermissions], import("@metamask/snap-utils/*").InstallSnapsResult> | import("@metamask/types").PermittedHandlerExport<void, import("@metamask/types").JsonRpcRequest<unknown>, unknown>)[];
