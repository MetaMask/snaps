import { SnapKeyring } from '@metamask/snap-types';
import { JsonRpcRequest } from '@metamask/utils';

/**
 * Wraps a SnapKeyring class, returning a handler that can route requests to the exposed functions by the class.
 *
 * @param keyring - The SnapKeyring instance.
 * @returns A handler function.
 */
export function wrapKeyring(keyring?: SnapKeyring) {
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
    // @ts-expect-error TODO: Figure out how to type this better
    const func = keyring[method];
    return func(...(params ?? []));
  };
  return keyringHandler;
}
