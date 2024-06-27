import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetInterfaceStateParams, GetInterfaceStateResult, InterfaceState } from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
export declare type GetInterfaceStateMethodHooks = {
    /**
     * @param id - The interface ID.
     * @returns The interface state.
     */
    getInterfaceState: (id: string) => InterfaceState;
};
export declare const getInterfaceStateHandler: PermittedHandlerExport<GetInterfaceStateMethodHooks, GetInterfaceStateParameters, GetInterfaceStateResult>;
declare const GetInterfaceStateParametersStruct: import("@metamask/superstruct").Struct<{
    id: string;
}, {
    id: import("@metamask/superstruct").Struct<string, null>;
}>;
export declare type GetInterfaceStateParameters = InferMatching<typeof GetInterfaceStateParametersStruct, GetInterfaceStateParams>;
export {};
