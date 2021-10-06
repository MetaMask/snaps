import { Json } from '@metamask/controllers';
import { MetaMaskInpageProvider } from '@metamask/inpage-provider';

/**
 * Command request sent to a worker.
 */
export interface WorkerCommandRequest {
  id: string;
  command: string;
  data?: string | Record<string, unknown>;
}

export interface PluginData {
  pluginName: string;
  sourceCode: string;
}

export type PluginRpcHandler = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

export interface PluginProvider extends MetaMaskInpageProvider {
  registerRpcMessageHandler: (handler: PluginRpcHandler) => void;
}
type PluginName = string;
export interface ErrorMessageEvent {
  type: 'PluginExecutionService:unhandledError';
  payload: [PluginName, { message: string; code: number; data?: Json }];
}
