import type { HandlerType } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { useMatch } from 'react-router-dom';

type SupportedHandler =
  | HandlerType.OnRpcRequest
  | HandlerType.OnCronjob
  | HandlerType.OnTransaction;

/**
 * Get the handler ID from the current route.
 *
 * @returns The handler ID from the current route.
 */
export function useHandler(): SupportedHandler {
  const match = useMatch('/handler/:handlerId');
  const handlerId = match?.params.handlerId;

  assert(handlerId, '`useHandler` must be used within a `Handler` component.');

  return handlerId as SupportedHandler;
}
