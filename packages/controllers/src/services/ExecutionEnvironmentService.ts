import { JsonRpcRequest } from 'json-rpc-engine';
import { PluginData } from '@metamask/snap-types';
import { PluginRpcHook } from './WebWorkerExecutionEnvironmentService';

export interface PluginMetadata {
  hostname: string;
}

export type TerminatePlugin = (pluginName: string) => Promise<void>;
export type Command = (
  pluginName: string,
  message: JsonRpcRequest<unknown>,
) => Promise<unknown>;
export type TerminateAll = () => Promise<void>;
export type CreatePluginEnvironment = (
  metadata: PluginMetadata,
) => Promise<string>;
export type ExecutePlugin = (pluginData: PluginData) => Promise<unknown>;
export type GetRpcMessageHandler = (
  pluginName: string,
) => Promise<PluginRpcHook | undefined>;

export interface ExecutionEnvironmentService {
  terminatePlugin: TerminatePlugin;
  terminateAllPlugins: TerminateAll;
  executePlugin: ExecutePlugin;
  getRpcMessageHandler: GetRpcMessageHandler;
}
