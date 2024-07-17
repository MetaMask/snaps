import type { Infer } from '@metamask/superstruct';
export declare const CronjobRpcRequestStruct: import("@metamask/superstruct").Struct<{
    method: string;
    id?: string | number | null | undefined;
    jsonrpc?: "2.0" | undefined;
    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
}, {
    jsonrpc: import("@metamask/superstruct").Struct<"2.0" | undefined, "2.0">;
    id: import("@metamask/superstruct").Struct<string | number | null | undefined, null>;
    method: import("@metamask/superstruct").Struct<string, null>;
    params: import("@metamask/superstruct").Struct<Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined, null>;
}>;
export declare type CronjobRpcRequest = Infer<typeof CronjobRpcRequestStruct>;
export declare const CronExpressionStruct: import("@metamask/superstruct").Struct<string, null>;
export declare type CronExpression = Infer<typeof CronExpressionStruct>;
/**
 * Parses a cron expression.
 *
 * @param expression - Expression to parse.
 * @returns A CronExpression class instance.
 */
export declare function parseCronExpression(expression: string | object): import("cron-parser").CronExpression<false>;
export declare const CronjobSpecificationStruct: import("@metamask/superstruct").Struct<{
    request: {
        method: string;
        id?: string | number | null | undefined;
        jsonrpc?: "2.0" | undefined;
        params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
    };
    expression: string;
}, {
    expression: import("@metamask/superstruct").Struct<string, null>;
    request: import("@metamask/superstruct").Struct<{
        method: string;
        id?: string | number | null | undefined;
        jsonrpc?: "2.0" | undefined;
        params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
    }, {
        jsonrpc: import("@metamask/superstruct").Struct<"2.0" | undefined, "2.0">;
        id: import("@metamask/superstruct").Struct<string | number | null | undefined, null>;
        method: import("@metamask/superstruct").Struct<string, null>;
        params: import("@metamask/superstruct").Struct<Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined, null>;
    }>;
}>;
export declare type CronjobSpecification = Infer<typeof CronjobSpecificationStruct>;
/**
 * Check if the given value is a {@link CronjobSpecification} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link CronjobSpecification} object.
 */
export declare function isCronjobSpecification(value: unknown): boolean;
export declare const CronjobSpecificationArrayStruct: import("@metamask/superstruct").Struct<{
    request: {
        method: string;
        id?: string | number | null | undefined;
        jsonrpc?: "2.0" | undefined;
        params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
    };
    expression: string;
}[], import("@metamask/superstruct").Struct<{
    request: {
        method: string;
        id?: string | number | null | undefined;
        jsonrpc?: "2.0" | undefined;
        params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
    };
    expression: string;
}, {
    expression: import("@metamask/superstruct").Struct<string, null>;
    request: import("@metamask/superstruct").Struct<{
        method: string;
        id?: string | number | null | undefined;
        jsonrpc?: "2.0" | undefined;
        params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
    }, {
        jsonrpc: import("@metamask/superstruct").Struct<"2.0" | undefined, "2.0">;
        id: import("@metamask/superstruct").Struct<string | number | null | undefined, null>;
        method: import("@metamask/superstruct").Struct<string, null>;
        params: import("@metamask/superstruct").Struct<Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined, null>;
    }>;
}>>;
/**
 * Check if the given value is an array of {@link CronjobSpecification} objects.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid array of {@link CronjobSpecification} objects.
 */
export declare function isCronjobSpecificationArray(value: unknown): boolean;
