import { JsonRpcRequest } from 'json-rpc-engine';
import { PluginData } from '@mm-snap/types';
import { PluginRpcHook } from './WebWorkerExecutionEnvironmentService';

export interface PluginMetadata {
  hostname: string;
}

export type TerminatePlugin = (pluginName: string) => void;
export type Command = (
  pluginName: string,
  message: JsonRpcRequest<unknown>,
) => Promise<unknown>;
export type TerminateAll = () => void;
export type CreatePluginEnvironment = (
  metadata: PluginMetadata,
) => Promise<string>;
export type StartPlugin = (pluginData: PluginData) => Promise<unknown>;
export type GetRpcMessageHandler = (
  pluginName: string,
) => PluginRpcHook | undefined;

export interface PluginExecutionEnvironmentService {
  terminatePlugin: TerminatePlugin;
  terminateAllPlugins: TerminateAll;
  startPlugin: StartPlugin;
  getRpcMessageHandler: GetRpcMessageHandler;
}
