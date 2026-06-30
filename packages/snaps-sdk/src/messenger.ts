/**
 * A constraint type matching a single messenger action.
 */
type ActionConstraint = {
  type: `${string}:${string}`;
  handler: (...args: never[]) => unknown;
};

/**
 * Extract the parameters of a messenger action by its type.
 *
 * @template Action - The union of actions to extract from.
 * @template ActionType - The type of the action to extract the parameters of.
 */
type ExtractActionParameters<
  Action extends ActionConstraint,
  ActionType extends Action['type'],
> = Action extends {
  type: ActionType;
  handler: (...args: infer Params) => unknown;
}
  ? Params
  : never;

/**
 * Extract the response of a messenger action by its type.
 *
 * @template Action - The union of actions to extract from.
 * @template ActionType - The type of the action to extract the response of.
 */
type ExtractActionResponse<
  Action extends ActionConstraint,
  ActionType extends Action['type'],
> = Action extends {
  type: ActionType;
  handler: (...args: never[]) => infer Response;
}
  ? Response
  : never;

/**
 * An asynchronous version of a messenger's `call` method. Calls made from
 * within a Snap are dispatched to the client via the `snap_messengerCall`
 * method, so the original (synchronous) return type is wrapped in a `Promise`.
 *
 * @template Action - The union of actions the messenger can call.
 */
export type AsyncMessenger<Action extends ActionConstraint> = {
  call: <ActionType extends Action['type']>(
    actionType: ActionType,
    ...params: ExtractActionParameters<Action, ActionType>
  ) => Promise<Awaited<ExtractActionResponse<Action, ActionType>>>;
};

/**
 * Get a messenger that can be used to call actions on the client
 * from within a Snap. The returned messenger is asynchronous.
 *
 * Note that this is only available to preinstalled Snaps.
 *
 * @template Action - The union of actions the messenger can call.
 * @returns An asynchronous messenger.
 */
export function getMessenger<
  Action extends ActionConstraint,
>(): AsyncMessenger<Action> {
  return {
    call: async (action, ...params) =>
      snap.request({
        method: 'snap_messengerCall',
        params: { action, params },
      }),
  } as AsyncMessenger<Action>;
}
