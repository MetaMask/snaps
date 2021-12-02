import { Json, RestrictedControllerMessenger } from '@metamask/controllers';
import { MetaMaskInpageProvider } from '@metamask/inpage-provider';

/**
 * Command request sent to a worker.
 */
export type WorkerCommandRequest = {
  id: string;
  command: string;
  data?: string | Record<string, unknown>;
};

export type SnapData = {
  snapName: string;
  sourceCode: string;
};

export type SnapRpcHandler = (
  origin: string,
  request: Record<string, unknown>,
) => Promise<unknown>;

export type SnapProvider = {
  registerRpcMessageHandler: (handler: SnapRpcHandler) => void;
} & MetaMaskInpageProvider;
type SnapName = string;
export type ErrorJSON = {
  message: string;
  code: number;
  data?: Json;
};
export type ErrorMessageEvent = {
  type: 'ServiceMessenger:unhandledError';
  payload: [SnapName, ErrorJSON];
};
export type UnresponsiveMessageEvent = {
  type: 'ServiceMessenger:unresponsive';
  payload: [SnapName];
};
export type ServiceMessenger = RestrictedControllerMessenger<
  'ServiceMessenger',
  never,
  ErrorMessageEvent | UnresponsiveMessageEvent,
  never,
  ErrorMessageEvent['type'] | UnresponsiveMessageEvent['type']
>;
