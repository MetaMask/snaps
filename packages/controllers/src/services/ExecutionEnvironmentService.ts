import { JsonRpcRequest } from 'json-rpc-engine';
import { SnapData } from '@metamask/snap-types';
import { Json } from '@metamask/controllers';
import { SnapRpcHook } from './WebWorkerExecutionEnvironmentService';

export type ExecuteSnapData = SnapData & {
  endowments?: Json;
};

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
export type ExecuteSnap = (snapData: ExecuteSnapData) => Promise<unknown>;
export type GetRpcMessageHandler = (
  snapId: string,
) => Promise<SnapRpcHook | undefined>;

export interface ExecutionEnvironmentService {
  terminateSnap: TerminateSnap;
  terminateAllSnaps: TerminateAll;
  executeSnap: ExecuteSnap;
  getRpcMessageHandler: GetRpcMessageHandler;
}
