import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { SnapsRegistryDatabase } from '@metamask/snaps-registry';
import type { Hex } from '@metamask/utils';
import type { SnapsRegistry } from './registry';
declare type JsonSnapsRegistryUrl = {
    registry: string;
    signature: string;
};
export declare type JsonSnapsRegistryArgs = {
    messenger: SnapsRegistryMessenger;
    state?: SnapsRegistryState;
    fetchFunction?: typeof fetch;
    url?: JsonSnapsRegistryUrl;
    recentFetchThreshold?: number;
    refetchOnAllowlistMiss?: boolean;
    publicKey?: Hex;
};
export declare type GetResult = {
    type: `${typeof controllerName}:get`;
    handler: SnapsRegistry['get'];
};
export declare type ResolveVersion = {
    type: `${typeof controllerName}:resolveVersion`;
    handler: SnapsRegistry['resolveVersion'];
};
export declare type GetMetadata = {
    type: `${typeof controllerName}:getMetadata`;
    handler: SnapsRegistry['getMetadata'];
};
export declare type Update = {
    type: `${typeof controllerName}:update`;
    handler: SnapsRegistry['update'];
};
export declare type SnapsRegistryActions = GetResult | GetMetadata | Update | ResolveVersion;
export declare type SnapsRegistryEvents = never;
export declare type SnapsRegistryMessenger = RestrictedControllerMessenger<'SnapsRegistry', SnapsRegistryActions, SnapsRegistryEvents, SnapsRegistryActions['type'], SnapsRegistryEvents['type']>;
export declare type SnapsRegistryState = {
    database: SnapsRegistryDatabase | null;
    lastUpdated: number | null;
    databaseUnavailable: boolean;
};
declare const controllerName = "SnapsRegistry";
export declare class JsonSnapsRegistry extends BaseController<typeof controllerName, SnapsRegistryState, SnapsRegistryMessenger> {
    #private;
    constructor({ messenger, state, url, publicKey, fetchFunction, recentFetchThreshold, refetchOnAllowlistMiss, }: JsonSnapsRegistryArgs);
}
export {};
