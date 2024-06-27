import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetFileParams } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
export declare const GetFileArgsStruct: import("@metamask/superstruct").Struct<{
    path: string;
    encoding?: "base64" | "utf8" | "hex" | undefined;
}, {
    path: import("@metamask/superstruct").Struct<string, null>;
    encoding: import("@metamask/superstruct").Struct<"base64" | "utf8" | "hex" | undefined, null>;
}>;
export declare type InferredGetFileParams = InferMatching<typeof GetFileArgsStruct, GetFileParams>;
export declare const getFileHandler: PermittedHandlerExport<GetFileHooks, InferredGetFileParams, string>;
export declare type GetFileHooks = {
    getSnapFile: (path: InferredGetFileParams['path'], encoding: InferredGetFileParams['encoding']) => Promise<string>;
};
