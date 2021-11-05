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

export interface SnapData {
  snapName: string;
  sourceCode: string;
}

export type SnapRpcHandler = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

export interface SnapProvider extends MetaMaskInpageProvider {
  registerRpcMessageHandler: (handler: SnapRpcHandler) => void;
}
type SnapName = string;
export interface ErrorJSON {
  message: string;
  code: number;
  data?: Json;
}
export interface ErrorMessageEvent {
  type: 'ServiceMessenger:unhandledError';
  payload: [SnapName, ErrorJSON];
}
export interface UnresponsiveMessageEvent {
  type: 'ServiceMessenger:unresponsive';
  payload: [SnapName];
}
export type ServiceMessenger = RestrictedControllerMessenger<
  'ServiceMessenger',
  never,
  ErrorMessageEvent | UnresponsiveMessageEvent,
  never,
  ErrorMessageEvent['type'] | UnresponsiveMessageEvent['type']
>;
