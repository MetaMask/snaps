import { SnapKeyring } from '@metamask/snap-types';
import { JsonRpcNotification, JsonRpcRequest } from '@metamask/utils';

/**
 * Wraps a SnapKeyring class, returning a handler that can route requests to the exposed functions by the class.
 *
 * @param notify - The BaseSnapExecutor notify function, used for event communication.
 * @param keyring - The SnapKeyring instance.
 * @returns A handler function.
 */
export function wrapKeyring(
  notify: (
    requestObject: Omit<
      JsonRpcNotification<Record<string, unknown> | unknown[]>,
      'jsonrpc'
    >,
  ) => void,
  keyring?: SnapKeyring,
) {
  if (!keyring) {
    throw new Error('Keyring not exported');
  }

  const keyringHandler = ({
    request,
  }: {
    request: JsonRpcRequest<unknown[]>;
  }) => {
    const { method, params } = request;
    if (!(method in keyring)) {
      throw new Error(`Keyring does not expose ${method}`);
    }
    let args = params ?? [];
    // @ts-expect-error TODO: Figure out how to type this better
    const func = keyring[method].bind(keyring);
    // Special case for registering events
    if (method === 'on') {
      const data = args[0];
      const listener = (listenerArgs: unknown) =>
        notify({
          method: 'SnapKeyringEvent',
          params: { data, args: listenerArgs },
        });
      args = [data, listener];
    }
    return func(...args);
  };
  return keyringHandler;
}
