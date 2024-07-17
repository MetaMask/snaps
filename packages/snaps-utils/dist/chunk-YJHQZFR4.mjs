// src/cronjob.ts
import {
  array,
  create,
  object,
  optional,
  refine,
  string
} from "@metamask/superstruct";
import {
  JsonRpcIdStruct,
  JsonRpcParamsStruct,
  JsonRpcVersionStruct
} from "@metamask/utils";
import { parseExpression } from "cron-parser";
var CronjobRpcRequestStruct = object({
  jsonrpc: optional(JsonRpcVersionStruct),
  id: optional(JsonRpcIdStruct),
  method: string(),
  params: optional(JsonRpcParamsStruct)
});
var CronExpressionStruct = refine(
  string(),
  "CronExpression",
  (value) => {
    try {
      parseExpression(value);
      return true;
    } catch {
      return false;
    }
  }
);
function parseCronExpression(expression) {
  const ensureStringExpression = create(expression, CronExpressionStruct);
  return parseExpression(ensureStringExpression);
}
var CronjobSpecificationStruct = object({
  expression: CronExpressionStruct,
  request: CronjobRpcRequestStruct
});
function isCronjobSpecification(value) {
  try {
    create(value, CronjobSpecificationStruct);
    return true;
  } catch {
    return false;
  }
}
var CronjobSpecificationArrayStruct = array(
  CronjobSpecificationStruct
);
function isCronjobSpecificationArray(value) {
  try {
    create(value, CronjobSpecificationArrayStruct);
    return true;
  } catch {
    return false;
  }
}

export {
  CronjobRpcRequestStruct,
  CronExpressionStruct,
  parseCronExpression,
  CronjobSpecificationStruct,
  isCronjobSpecification,
  CronjobSpecificationArrayStruct,
  isCronjobSpecificationArray
};
//# sourceMappingURL=chunk-YJHQZFR4.mjs.map