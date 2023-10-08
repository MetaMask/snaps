import { JsonRpcRequestStruct } from '@metamask/utils';
import { parseExpression } from 'cron-parser';
import { array, assign, coerce, create, object, omit, optional, partial, pick, refine, string } from 'superstruct';
export const CronjobRpcRequestStruct = assign(partial(pick(JsonRpcRequestStruct, [
    'id',
    'jsonrpc'
])), omit(JsonRpcRequestStruct, [
    'id',
    'jsonrpc'
]));
export const CronExpressionStruct = refine(coerce(string(), object({
    minute: optional(string()),
    hour: optional(string()),
    dayOfMonth: optional(string()),
    month: optional(string()),
    dayOfWeek: optional(string())
}), (value)=>`${value.minute ?? '*'} ${value.hour ?? '*'} ${value.dayOfMonth ?? '*'} ${value.month ?? '*'} ${value.dayOfWeek ?? '*'}`), 'CronExpression', (value)=>{
    try {
        parseExpression(value);
        return true;
    } catch  {
        return false;
    }
});
/**
 * Parses a cron expression.
 *
 * @param expression - Expression to parse.
 * @returns A CronExpression class instance.
 */ export function parseCronExpression(expression) {
    const ensureStringExpression = create(expression, CronExpressionStruct);
    return parseExpression(ensureStringExpression);
}
export const CronjobSpecificationStruct = object({
    expression: CronExpressionStruct,
    request: CronjobRpcRequestStruct
});
/**
 * Check if the given value is a {@link CronjobSpecification} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link CronjobSpecification} object.
 */ export function isCronjobSpecification(value) {
    try {
        create(value, CronjobSpecificationStruct);
        return true;
    } catch  {
        return false;
    }
}
export const CronjobSpecificationArrayStruct = array(CronjobSpecificationStruct);
/**
 * Check if the given value is an array of {@link CronjobSpecification} objects.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid array of {@link CronjobSpecification} objects.
 */ export function isCronjobSpecificationArray(value) {
    try {
        create(value, CronjobSpecificationArrayStruct);
        return true;
    } catch  {
        return false;
    }
}

//# sourceMappingURL=cronjob.js.map