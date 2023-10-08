import type { JsonRpcParams } from '@metamask/utils';
/**
 * Deterministically sort JSON-RPC parameter keys. This makes it possible to
 * support both arrays and objects as parameters. Objects are sorted and turned
 * into arrays, for easier consumption by the snap.
 *
 * The order is defined by the `method` parameter.
 *
 * @param methodParams - The parameters of the JSON-RPC method, which
 * determines the ordering for the parameters.
 * @param params - JSON-RPC parameters as object or array.
 * @returns The values for the sorted keys. If `params` is not provided, this
 * returns an empty array. If `params` is an array, this returns the same
 * `params`.
 */
export declare const sortParamKeys: (methodParams: string[], params?: JsonRpcParams) => import("@metamask/utils").Json[];
