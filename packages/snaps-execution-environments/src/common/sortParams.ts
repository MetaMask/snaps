// original source sortParamKeys from: https://github.com/etclabscore/sig.tools/blob/master/src/postMessageServer/postMessageServer.ts#L75-L77

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
export const sortParamKeys = (
  methodParams: string[],
  params?: JsonRpcParams,
) => {
  if (!params) {
    return [];
  }

  if (params instanceof Array) {
    return params;
  }

  const methodParamsOrder: { [k: string]: number } = methodParams.reduce(
    (paramsOrderObj, paramsName, i) => ({
      ...paramsOrderObj,
      [paramsName]: i,
    }),
    {},
  );

  return Object.entries(params)
    .sort(
      ([name1, _1], [name2, _2]) =>
        methodParamsOrder[name1] - methodParamsOrder[name2],
    )
    .map(([_, val]) => val);
};
