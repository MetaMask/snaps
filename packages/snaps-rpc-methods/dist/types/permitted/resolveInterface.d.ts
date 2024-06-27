import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { ResolveInterfaceParams, ResolveInterfaceResult } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { type Json } from '@metamask/utils';
export declare type ResolveInterfaceMethodHooks = {
    /**
     * @param id - The interface id.
     * @param value - The value to resolve the interface with.
     */
    resolveInterface: (id: string, value: Json) => Promise<void>;
};
export declare const resolveInterfaceHandler: PermittedHandlerExport<ResolveInterfaceMethodHooks, ResolveInterfaceParameters, ResolveInterfaceResult>;
declare const ResolveInterfaceParametersStruct: import("@metamask/superstruct").Struct<{
    value: Json;
    id: string;
}, {
    id: import("@metamask/superstruct").Struct<string, null>;
    value: import("@metamask/superstruct").Struct<Json, unknown>;
}>;
export declare type ResolveInterfaceParameters = InferMatching<typeof ResolveInterfaceParametersStruct, ResolveInterfaceParams>;
export {};
