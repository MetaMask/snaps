import type { Component } from '@metamask/snaps-ui';
import type { Json, JsonRpcParams, JsonRpcRequest } from '@metamask/utils';
import type { EnumToUnion } from './enum';
import type { AccountAddress, Caip2ChainId } from './namespace';
export declare enum HandlerType {
    OnRpcRequest = "onRpcRequest",
    OnTransaction = "onTransaction",
    OnCronjob = "onCronjob",
    OnInstall = "onInstall",
    OnUpdate = "onUpdate",
    OnNameLookup = "onNameLookup",
    OnKeyringRequest = "onKeyringRequest"
}
declare type SnapHandler = {
    /**
     * The type of handler.
     */
    type: HandlerType;
    /**
     * Whether the handler is required, i.e., whether the request will fail if the
     * handler is called, but the snap does not export it.
     *
     * This is primarily used for the lifecycle handlers, which are optional.
     */
    required: boolean;
    /**
     * Validate the given snap export. This should return a type guard for the
     * handler type.
     *
     * @param snapExport - The export to validate.
     * @returns Whether the export is valid.
     */
    validator: (snapExport: unknown) => boolean;
};
export declare const SNAP_EXPORTS: {
    readonly onRpcRequest: {
        readonly type: HandlerType.OnRpcRequest;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnRpcRequestHandler<JsonRpcParams>;
    };
    readonly onTransaction: {
        readonly type: HandlerType.OnTransaction;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnTransactionHandler;
    };
    readonly onCronjob: {
        readonly type: HandlerType.OnCronjob;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnCronjobHandler<JsonRpcParams>;
    };
    readonly onNameLookup: {
        readonly type: HandlerType.OnNameLookup;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnNameLookupHandler;
    };
    readonly onInstall: {
        readonly type: HandlerType.OnInstall;
        readonly required: false;
        readonly validator: (snapExport: unknown) => snapExport is LifecycleEventHandler;
    };
    readonly onUpdate: {
        readonly type: HandlerType.OnUpdate;
        readonly required: false;
        readonly validator: (snapExport: unknown) => snapExport is LifecycleEventHandler;
    };
    readonly onKeyringRequest: {
        readonly type: HandlerType.OnKeyringRequest;
        readonly required: true;
        readonly validator: (snapExport: unknown) => snapExport is OnKeyringRequestHandler<JsonRpcParams>;
    };
};
/**
 * The `onRpcRequest` handler. This is called whenever a JSON-RPC request is
 * made to the snap.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin of the request. This can be the ID of another
 * snap, or the URL of a dapp.
 * @param args.request - The JSON-RPC request sent to the snap.
 * @returns The JSON-RPC response. This must be a JSON-serializable value.
 */
export declare type OnRpcRequestHandler<Params extends JsonRpcParams = JsonRpcParams> = (args: {
    origin: string;
    request: JsonRpcRequest<Params>;
}) => Promise<unknown>;
/**
 * Enum used to specify the severity level of content being returned from a transaction insight.
 */
export declare enum SeverityLevel {
    Critical = "critical"
}
/**
 * The response from a snap's `onTransaction` handler.
 *
 * @property content - A custom UI component, that will be shown in MetaMask. Can be created using `@metamask/snaps-ui`.
 *
 * If the snap has no insights about the transaction, this should be `null`.
 */
export declare type OnTransactionResponse = {
    content: Component | null;
    severity?: EnumToUnion<SeverityLevel>;
};
/**
 * The `onTransaction` handler. This is called whenever a transaction is
 * submitted to the snap. It can return insights about the transaction, which
 * will be displayed to the user.
 *
 * @param args - The request arguments.
 * @param args.transaction - The transaction object.
 * @param args.chainId - The CAIP-2 chain ID of the network the transaction is
 * being submitted to.
 * @param args.transactionOrigin - The origin of the transaction. This is the
 * URL of the dapp that submitted the transaction.
 * @returns Insights about the transaction. See {@link OnTransactionResponse}.
 */
export declare type OnTransactionHandler = (args: {
    transaction: {
        [key: string]: Json;
    };
    chainId: string;
    transactionOrigin?: string;
}) => Promise<OnTransactionResponse>;
/**
 * The `onCronjob` handler. This is called on a regular interval, as defined by
 * the snap's manifest.
 *
 * @param args - The request arguments.
 * @param args.request - The JSON-RPC request sent to the snap.
 */
export declare type OnCronjobHandler<Params extends JsonRpcParams = JsonRpcParams> = (args: {
    request: JsonRpcRequest<Params>;
}) => Promise<unknown>;
/**
 * A handler that can be used for the lifecycle hooks.
 */
export declare type LifecycleEventHandler = (args: {
    request: JsonRpcRequest;
}) => Promise<unknown>;
/**
 * The `onInstall` handler. This is called after the snap is installed.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 */
export declare type OnInstallHandler = LifecycleEventHandler;
/**
 * The `onUpdate` handler. This is called after the snap is updated.
 *
 * This type is an alias for {@link LifecycleEventHandler}.
 */
export declare type OnUpdateHandler = LifecycleEventHandler;
/**
 * The `onKeyringRequest` handler. This is called by the MetaMask client for
 * privileged keyring actions.
 *
 * @param args - The request arguments.
 * @param args.origin - The origin of the request. This can be the ID of
 * another snap, or the URL of a dapp.
 * @param args.request - The JSON-RPC request sent to the snap.
 */
export declare type OnKeyringRequestHandler<Params extends JsonRpcParams = JsonRpcParams> = (args: {
    origin: string;
    request: JsonRpcRequest<Params>;
}) => Promise<unknown>;
/**
 * Utility type for getting the handler function type from a handler type.
 */
export declare type HandlerFunction<Type extends SnapHandler> = Type['validator'] extends (snapExport: unknown) => snapExport is infer Handler ? Handler : never;
/**
 * The response from a snap's `onNameLookup` handler.
 *
 * @property resolvedAddress - The resolved address for a given domain.
 * @property resolvedDomain - The resolved domain for a given address.
 *
 *
 * If the snap has no resolved address/domain from its lookup, this should be `null`.
 */
export declare type OnNameLookupResponse = {
    resolvedAddress: AccountAddress;
    resolvedDomain?: never;
} | {
    resolvedDomain: string;
    resolvedAddress?: never;
} | null;
export declare type OnNameLookupArgs = {
    chainId: Caip2ChainId;
} & ({
    domain: string;
    address?: never;
} | {
    address: string;
    domain?: never;
});
/**
 * The `onNameLookup` handler. This is called whenever content is entered
 * into the send to field for sending assets to an EOA address.
 *
 * @param args - The request arguments.
 * @param args.domain - The human-readable address that is to be resolved.
 * @param args.chainId - The CAIP-2 chain ID of the network the transaction is
 * being submitted to.
 * @param args.address - The address that is to be resolved.
 * @returns Resolved address/domain from the lookup. See {@link OnNameLookupResponse}.
 */
export declare type OnNameLookupHandler = (args: OnNameLookupArgs) => Promise<OnNameLookupResponse>;
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
export {};
