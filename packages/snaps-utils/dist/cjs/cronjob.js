"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    CronjobRpcRequestStruct: function() {
        return CronjobRpcRequestStruct;
    },
    CronExpressionStruct: function() {
        return CronExpressionStruct;
    },
    parseCronExpression: function() {
        return parseCronExpression;
    },
    CronjobSpecificationStruct: function() {
        return CronjobSpecificationStruct;
    },
    isCronjobSpecification: function() {
        return isCronjobSpecification;
    },
    CronjobSpecificationArrayStruct: function() {
        return CronjobSpecificationArrayStruct;
    },
    isCronjobSpecificationArray: function() {
        return isCronjobSpecificationArray;
    }
});
const _utils = require("@metamask/utils");
const _cronparser = require("cron-parser");
const _superstruct = require("superstruct");
const CronjobRpcRequestStruct = (0, _superstruct.assign)((0, _superstruct.partial)((0, _superstruct.pick)(_utils.JsonRpcRequestStruct, [
    'id',
    'jsonrpc'
])), (0, _superstruct.omit)(_utils.JsonRpcRequestStruct, [
    'id',
    'jsonrpc'
]));
const CronExpressionStruct = (0, _superstruct.refine)((0, _superstruct.coerce)((0, _superstruct.string)(), (0, _superstruct.object)({
    minute: (0, _superstruct.optional)((0, _superstruct.string)()),
    hour: (0, _superstruct.optional)((0, _superstruct.string)()),
    dayOfMonth: (0, _superstruct.optional)((0, _superstruct.string)()),
    month: (0, _superstruct.optional)((0, _superstruct.string)()),
    dayOfWeek: (0, _superstruct.optional)((0, _superstruct.string)())
}), (value)=>`${value.minute ?? '*'} ${value.hour ?? '*'} ${value.dayOfMonth ?? '*'} ${value.month ?? '*'} ${value.dayOfWeek ?? '*'}`), 'CronExpression', (value)=>{
    try {
        (0, _cronparser.parseExpression)(value);
        return true;
    } catch  {
        return false;
    }
});
function parseCronExpression(expression) {
    const ensureStringExpression = (0, _superstruct.create)(expression, CronExpressionStruct);
    return (0, _cronparser.parseExpression)(ensureStringExpression);
}
const CronjobSpecificationStruct = (0, _superstruct.object)({
    expression: CronExpressionStruct,
    request: CronjobRpcRequestStruct
});
function isCronjobSpecification(value) {
    try {
        (0, _superstruct.create)(value, CronjobSpecificationStruct);
        return true;
    } catch  {
        return false;
    }
}
const CronjobSpecificationArrayStruct = (0, _superstruct.array)(CronjobSpecificationStruct);
function isCronjobSpecificationArray(value) {
    try {
        (0, _superstruct.create)(value, CronjobSpecificationArrayStruct);
        return true;
    } catch  {
        return false;
    }
}

//# sourceMappingURL=cronjob.js.map