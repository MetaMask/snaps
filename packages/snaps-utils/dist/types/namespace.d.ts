import type { AccountId, ChainId } from '@metamask/snaps-sdk';
import type { Infer } from '@metamask/superstruct';
import type { InferMatching } from './structs';
export declare const CHAIN_ID_REGEX: RegExp;
export declare const ACCOUNT_ID_REGEX: RegExp;
export declare const ACCOUNT_ADDRESS_REGEX: RegExp;
/**
 * Parse a chain ID string to an object containing the namespace and reference.
 * This validates the chain ID before parsing it.
 *
 * @param chainId - The chain ID to validate and parse.
 * @returns The parsed chain ID.
 */
export declare function parseChainId(chainId: ChainId): {
    namespace: NamespaceId;
    reference: string;
};
/**
 * Parse an account ID to an object containing the chain, chain ID and address.
 * This validates the account ID before parsing it.
 *
 * @param accountId - The account ID to validate and parse.
 * @returns The parsed account ID.
 */
export declare function parseAccountId(accountId: AccountId): {
    chain: {
        namespace: NamespaceId;
        reference: string;
    };
    chainId: ChainId;
    address: string;
};
/**
 * A helper struct for a string with a minimum length of 1 and a maximum length
 * of 40.
 */
export declare const LimitedString: import("@metamask/superstruct").Struct<string, null>;
export declare const ChainIdStringStruct: import("@metamask/superstruct").Struct<`${string}:${string}`, null>;
/**
 * A CAIP-2 chain ID, i.e., a human-readable namespace and reference.
 */
export declare const ChainIdStruct: import("@metamask/superstruct").Struct<`${string}:${string}`, null>;
export declare type Caip2ChainId = InferMatching<typeof ChainIdStruct, ChainId>;
export declare const AccountIdStruct: import("@metamask/superstruct").Struct<string, null>;
export declare const AccountIdArrayStruct: import("@metamask/superstruct").Struct<string[], import("@metamask/superstruct").Struct<string, null>>;
export declare const AccountAddressStruct: import("@metamask/superstruct").Struct<string, null>;
export declare type AccountAddress = Infer<typeof AccountAddressStruct>;
/**
 * A chain descriptor.
 */
export declare const ChainStruct: import("@metamask/superstruct").Struct<{
    name: string;
    id: `${string}:${string}`;
}, {
    id: import("@metamask/superstruct").Struct<`${string}:${string}`, null>;
    name: import("@metamask/superstruct").Struct<string, null>;
}>;
export declare type Chain = Infer<typeof ChainStruct>;
export declare const NamespaceStruct: import("@metamask/superstruct").Struct<{
    chains: {
        name: string;
        id: `${string}:${string}`;
    }[];
    methods?: string[] | undefined;
    events?: string[] | undefined;
}, {
    /**
     * A list of supported chains in the namespace.
     */
    chains: import("@metamask/superstruct").Struct<{
        name: string;
        id: `${string}:${string}`;
    }[], import("@metamask/superstruct").Struct<{
        name: string;
        id: `${string}:${string}`;
    }, {
        id: import("@metamask/superstruct").Struct<`${string}:${string}`, null>;
        name: import("@metamask/superstruct").Struct<string, null>;
    }>>;
    /**
     * A list of supported RPC methods on the namespace, that a DApp can call.
     */
    methods: import("@metamask/superstruct").Struct<string[] | undefined, import("@metamask/superstruct").Struct<string, null>>;
    /**
     * A list of supported RPC events on the namespace, that a DApp can listen to.
     */
    events: import("@metamask/superstruct").Struct<string[] | undefined, import("@metamask/superstruct").Struct<string, null>>;
}>;
export declare type Namespace = Infer<typeof NamespaceStruct>;
/**
 * A CAIP-2 namespace, i.e., the first part of a chain ID.
 */
export declare const NamespaceIdStruct: import("@metamask/superstruct").Struct<string, null>;
export declare type NamespaceId = Infer<typeof NamespaceIdStruct>;
/**
 * Check if the given value is a CAIP-2 namespace ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a CAIP-2 namespace ID.
 */
export declare function isNamespaceId(value: unknown): value is NamespaceId;
/**
 * Check if the given value is a CAIP-2 chain ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a CAIP-2 chain ID.
 */
export declare function isChainId(value: unknown): value is ChainId;
/**
 * Check if the given value is a CAIP-10 account ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a CAIP-10 account ID.
 */
export declare function isAccountId(value: unknown): value is AccountId;
/**
 * Check if the given value is an array of CAIP-10 account IDs.
 *
 * @param value - The value to check.
 * @returns Whether the value is an array of CAIP-10 account IDs.
 */
export declare function isAccountIdArray(value: unknown): value is AccountId[];
/**
 * Check if a value is a {@link Namespace}.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid {@link Namespace}.
 */
export declare function isNamespace(value: unknown): value is Namespace;
