import { MetaMaskInpageProvider } from '@metamask/inpage-provider';

/**
 * Command request sent to a worker.
 */
export interface WorkerCommandRequest {
  id: number;
  command: string;
  data?: string | Record<string, unknown>;
}

export interface PluginData {
  pluginName: string;
  sourceCode: string;
}

export type PluginRpcHandler = (origin: string, request: Record<string, unknown>) => Promise<unknown>;

export interface PluginProvider extends MetaMaskInpageProvider {
  registerRpcMessageHandler: (handler: PluginRpcHandler) => void;
}
