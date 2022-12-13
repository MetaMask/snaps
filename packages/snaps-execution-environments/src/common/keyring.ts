import { SnapKeyring } from '@metamask/snaps-utils';
import {
  assert,
  isValidJson,
  Json,
  JsonRpcNotification,
  JsonRpcRequest,
} from '@metamask/utils';

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
      JsonRpcNotification<Record<string, Json> | Json[]>,
      'jsonrpc'
    >,
  ) => void,
  keyring?: SnapKeyring,
) {
  if (!keyring) {
    throw new Error('Keyring not exported');
  }

  const keyringHandler = ({ request }: { request: JsonRpcRequest<Json[]> }) => {
    const { method, params } = request;
    if (!(method in keyring)) {
      throw new Error(`Keyring does not expose ${method}`);
    }
    let args = (params ?? []) as unknown[];
    const keyringMethod = keyring[method as keyof SnapKeyring];
    assert(keyringMethod !== undefined);
    const func = keyringMethod.bind(keyring);
    // Special case for registering events
    if (method === 'on') {
      const data = args[0] as Json;
      const listener = (...listenerArgs: unknown[]) => {
        assert(
          isValidJson(listenerArgs),
          new TypeError(
            'Keyrings .on listener received non-JSON-serializable value.',
          ),
        );
        return notify({
          method: 'SnapKeyringEvent',
          params: { data, args: listenerArgs },
        });
      };
      args = [data, listener];
    }
    return (func as (..._: unknown[]) => unknown)(...args);
  };
  return keyringHandler;
}
