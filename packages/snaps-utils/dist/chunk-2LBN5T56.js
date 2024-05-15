"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/cronjob.ts




var _utils = require('@metamask/utils');
var _cronparser = require('cron-parser');
var _superstruct = require('superstruct');
var CronjobRpcRequestStruct = _superstruct.object.call(void 0, {
  jsonrpc: _superstruct.optional.call(void 0, _utils.JsonRpcVersionStruct),
  id: _superstruct.optional.call(void 0, _utils.JsonRpcIdStruct),
  method: _superstruct.string.call(void 0, ),
  params: _superstruct.optional.call(void 0, _utils.JsonRpcParamsStruct)
});
var CronExpressionStruct = _superstruct.refine.call(void 0, 
  _superstruct.string.call(void 0, ),
  "CronExpression",
  (value) => {
    try {
      _cronparser.parseExpression.call(void 0, value);
      return true;
    } catch {
      return false;
    }
  }
);
function parseCronExpression(expression) {
  const ensureStringExpression = _superstruct.create.call(void 0, expression, CronExpressionStruct);
  return _cronparser.parseExpression.call(void 0, ensureStringExpression);
}
var CronjobSpecificationStruct = _superstruct.object.call(void 0, {
  expression: CronExpressionStruct,
  request: CronjobRpcRequestStruct
});
function isCronjobSpecification(value) {
  try {
    _superstruct.create.call(void 0, value, CronjobSpecificationStruct);
    return true;
  } catch {
    return false;
  }
}
var CronjobSpecificationArrayStruct = _superstruct.array.call(void 0, 
  CronjobSpecificationStruct
);
function isCronjobSpecificationArray(value) {
  try {
    _superstruct.create.call(void 0, value, CronjobSpecificationArrayStruct);
    return true;
  } catch {
    return false;
  }
}









exports.CronjobRpcRequestStruct = CronjobRpcRequestStruct; exports.CronExpressionStruct = CronExpressionStruct; exports.parseCronExpression = parseCronExpression; exports.CronjobSpecificationStruct = CronjobSpecificationStruct; exports.isCronjobSpecification = isCronjobSpecification; exports.CronjobSpecificationArrayStruct = CronjobSpecificationArrayStruct; exports.isCronjobSpecificationArray = isCronjobSpecificationArray;
//# sourceMappingURL=chunk-2LBN5T56.js.map