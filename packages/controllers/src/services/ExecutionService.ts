import { SnapExecutionData } from '@metamask/snap-types';
import type { JsonRpcRequest } from '@metamask/utils';
import { SnapRpcHook } from './AbstractExecutionService';

export interface SnapMetadata {
  hostname: string;
}

export type TerminateSnap = (snapId: string) => Promise<void>;
export type Command = (
  snapId: string,
  message: JsonRpcRequest<unknown>,
) => Promise<unknown>;
export type TerminateAll = () => Promise<void>;
export type CreateSnapEnvironment = (metadata: SnapMetadata) => Promise<string>;
export type ExecuteSnap = (snapData: SnapExecutionData) => Promise<unknown>;
export type GetRpcRequestHandler = (
  snapId: string,
) => Promise<SnapRpcHook | undefined>;

export interface ExecutionService {
  terminateSnap: TerminateSnap;
  terminateAllSnaps: TerminateAll;
  executeSnap: ExecuteSnap;
  getRpcRequestHandler: GetRpcRequestHandler;
}
