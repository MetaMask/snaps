import type {
  ActionConstraint,
  EventConstraint,
  ExtractActionParameters,
  ExtractActionResponse,
  Messenger,
  MessengerActions,
  NamespacedName,
} from '@metamask/messenger';
import type { Json } from '@metamask/utils';

/**
 * A constraint type matching any messenger. Used to constrain the generic
 * messenger type accepted by {@link getMessenger} and {@link AsyncMessenger}.
 */
type MessengerConstraint = Messenger<string, ActionConstraint, EventConstraint>;

/**
 * An asynchronous version of a messenger's `call` method. Calls made from
 * within a Snap are dispatched to the client via the `snap_messengerCall`
 * method, so the original (synchronous) return type is wrapped in a `Promise`.
 *
 * @template MessengerType - The messenger the Snap can call actions on.
 */
export type AsyncMessenger<MessengerType extends MessengerConstraint> = {
  call: <ActionType extends MessengerActions<MessengerType>['type']>(
    actionType: ActionType,
    ...params: ExtractActionParameters<
      MessengerActions<MessengerType>,
      ActionType
    >
  ) => Promise<
    Awaited<ExtractActionResponse<MessengerActions<MessengerType>, ActionType>>
  >;
};

/**
 * Get a messenger that can be used to call actions on the client
 * from within a Snap. The returned messenger is asynchronous.
 *
 * Note that this is only available to preinstalled Snaps.
 *
 * @template MessengerType - The messenger the Snap can call actions on. This is
 * a `Messenger` type from `@metamask/messenger`; the callable actions are
 * derived from it automatically.
 * @returns An asynchronous messenger.
 */
export function getMessenger<
  MessengerType extends MessengerConstraint,
>(): AsyncMessenger<MessengerType> {
  return {
    async call(action: NamespacedName, ...params: Json[]) {
      return snap.request({
        method: 'snap_messengerCall',
        params: { action, params },
      });
    },
  } as AsyncMessenger<MessengerType>;
}
