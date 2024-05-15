/**
 * This map registers the type of the {@link VirtualFile.data} key of a {@link VirtualFile}.
 *
 * This type can be augmented to register custom `data` types.
 *
 * @example
 * declare module '@metamask/snaps-utils' {
 *   interface DataMap {
 *     // `file.data.name` is typed as `string`
 *     name: string
 *   }
 * }
 */
export interface DataMap {
}
export declare type Value = string | Uint8Array;
export declare type Compatible<Result = unknown> = string | Uint8Array | Options<Result>;
export declare type Data = Record<string, unknown> & Partial<DataMap>;
export declare type Options<Result = unknown> = {
    value: Value;
    path?: string;
    data?: Data;
    result?: Result;
};
export declare class VirtualFile<Result = unknown> {
    constructor(value?: Compatible<Result>);
    value: Value;
    result: Result;
    data: Data;
    path: string;
    toString(encoding?: string): string;
    clone(): VirtualFile<Result>;
}
