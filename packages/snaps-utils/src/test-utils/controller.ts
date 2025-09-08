import type {
  ActionConstraint,
  ActionHandler,
  EventConstraint,
  MockAnyNamespace,
} from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';

export class MockControllerMessenger<
  Action extends ActionConstraint,
  Event extends EventConstraint,
> extends Messenger<MockAnyNamespace, Action, Event> {
  constructor() {
    super({ namespace: MOCK_ANY_NAMESPACE });
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
    super.unregisterActionHandler(actionType);
    super.registerActionHandler(actionType, handler);
  }
}
