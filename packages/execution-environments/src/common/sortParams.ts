// original source sortParamKeys from: https://github.com/etclabscore/sig.tools/blob/master/src/postMessageServer/postMessageServer.ts#L75-L77

import { JSONRPCParams } from '../__GENERATED__/openrpc';

/**
 *
 * @param method A method object pulled from the openRPC JSON document
 * @param params An array or object of params
 * @description This method will simply return an array of params
 * if it is passed an array and will return a sorted param list based on the
 * order in the method.params array if params is an object
 * @returns An array of sorted params
 */
export const getSortedParams = (
  method: { params: { name: string }[] },
  params?: JSONRPCParams,
) => {
  if (!params) {
    return [];
  }

  if (params instanceof Array) {
    return params;
  }

  const methodParamsOrder: { [k: string]: number } = method.params
    .map((param) => param.name)
    .reduce(
      (paramsOrderObj, paramsName, i) => ({
        ...paramsOrderObj,
        [paramsName]: i,
      }),
      {},
    );

  return Object.entries(params)
    .sort(
      ([name1, _], [name2, __]) =>
        methodParamsOrder[name1] - methodParamsOrder[name2],
    )
    .map(([_, val]) => val);
};
