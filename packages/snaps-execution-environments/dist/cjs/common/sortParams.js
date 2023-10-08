// original source sortParamKeys from: https://github.com/etclabscore/sig.tools/blob/master/src/postMessageServer/postMessageServer.ts#L75-L77
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "sortParamKeys", {
    enumerable: true,
    get: function() {
        return sortParamKeys;
    }
});
const sortParamKeys = (methodParams, params)=>{
    if (!params) {
        return [];
    }
    if (params instanceof Array) {
        return params;
    }
    const methodParamsOrder = methodParams.reduce((paramsOrderObj, paramsName, i)=>({
            ...paramsOrderObj,
            [paramsName]: i
        }), {});
    return Object.entries(params).sort(([name1, _1], [name2, _2])=>methodParamsOrder[name1] - methodParamsOrder[name2]).map(([_, val])=>val);
};

//# sourceMappingURL=sortParams.js.map