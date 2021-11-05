import { JsonRpcRequest } from 'json-rpc-engine';
import { SnapData } from '@metamask/snap-types';
import { SnapRpcHook } from './WebWorkerExecutionEnvironmentService';

export interface SnapMetadata {
  hostname: string;
}

export type TerminateSnap = (snapName: string) => Promise<void>;
export type Command = (
  snapName: string,
  message: JsonRpcRequest<unknown>,
) => Promise<unknown>;
export type TerminateAll = () => Promise<void>;
export type CreateSnapEnvironment = (
  metadata: SnapMetadata,
) => Promise<string>;
export type ExecuteSnap = (snapData: SnapData) => Promise<unknown>;
export type GetRpcMessageHandler = (
  snapName: string,
) => Promise<SnapRpcHook | undefined>;

export interface ExecutionEnvironmentService {
  terminateSnap: TerminateSnap;
  terminateAllSnaps: TerminateAll;
  executeSnap: ExecuteSnap;
  getRpcMessageHandler: GetRpcMessageHandler;
}
