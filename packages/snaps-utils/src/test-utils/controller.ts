import type {
  ActionConstraint,
  ActionHandler,
  EventConstraint,
  ExtractEventPayload,
} from '@metamask/messenger';
import { Messenger } from '@metamask/messenger';

export class MockControllerMessenger<
  Action extends ActionConstraint,
  Event extends EventConstraint,
> extends Messenger<'MockMessenger', Action, Event> {
  constructor() {
    super({ namespace: 'MockMessenger' });
  }

  /**
   * Registers an action handler for the given action type. If an action handler
   * already exists for the given action type, it will be overwritten.
   *
   * @param actionType - The action type to register the handler for.
   * @param handler - The action handler to register.
   */
  registerActionHandler<ActionType extends Action['type']>(
    actionType: ActionType,
    handler: ActionHandler<Action, ActionType>,
  ) {
    // TODO: Undo this once you can unregister/register globally for tests
    super._internalUnregisterDelegatedActionHandler(actionType);
    super._internalRegisterDelegatedActionHandler(actionType, handler);
  }

  unregisterActionHandler<ActionType extends Action['type']>(
    actionType: ActionType,
  ) {
    // TODO: Undo this once you can unregister/register globally for tests
    super._internalUnregisterDelegatedActionHandler(actionType);
  }

  publish<EventType extends Event['type']>(
    eventType: EventType,
    ...payload: ExtractEventPayload<Event, EventType>
  ): void {
    // TODO: Undo this once you can publish globally for tests
    super._internalPublishDelegated(eventType, ...payload);
  }
}
