// original source sortParamKeys from: https://github.com/etclabscore/sig.tools/blob/master/src/postMessageServer/postMessageServer.ts#L75-L77

import { JSONRPCParams } from '../__GENERATED__/openrpc';

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
