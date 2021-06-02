import { JsonRpcRequest } from 'json-rpc-engine';
import { PluginData } from '@mm-snap/types';

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

export interface PluginExecutionEnvironmentService {
  terminatePlugin: TerminatePlugin;
  terminateAllPlugins: TerminateAll;
  createPluginEnvironment: CreatePluginEnvironment;
  command: Command;
  startPlugin: StartPlugin;
}
