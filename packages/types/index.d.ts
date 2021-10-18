import { Json, RestrictedControllerMessenger } from '@metamask/controllers';
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
export interface ErrorJSON {
  message: string;
  code: number;
  data?: Json;
}
export interface ErrorMessageEvent {
  type: 'ServiceMessenger:unhandledError';
  payload: [PluginName, ErrorJSON];
}
export interface UnresponsiveMessageEvent {
  type: 'ServiceMessenger:unresponsive';
  payload: [PluginName];
}
export type ServiceMessenger = RestrictedControllerMessenger<
  'ServiceMessenger',
  never,
  ErrorMessageEvent | UnresponsiveMessageEvent,
  never,
  ErrorMessageEvent['type'] | UnresponsiveMessageEvent['type']
>;
