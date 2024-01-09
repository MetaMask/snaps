import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { Component, InterfaceState } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import { nanoid } from 'nanoid';

import { constructState } from './utils';

const controllerName = 'InterfaceController';

// @TODO: Add actions for functions

export type CreateInterface = {
  type: `${typeof controllerName}:createInterface`;
  handler: InterfaceController['createInterface'];
};

export type GetInterface = {
  type: `${typeof controllerName}:getInterface`;
  handler: InterfaceController['getInterface'];
};

export type UpdateInterface = {
  type: `${typeof controllerName}:updateInterface`;
  handler: InterfaceController['updateInterface'];
};

export type DeleteInterface = {
  type: `${typeof controllerName}:deleteInterface`;
  handler: InterfaceController['deleteInterface'];
};

export type UpdateInterfaceState = {
  type: `${typeof controllerName}:updateInterfaceState`;
  handler: InterfaceController['updateInterfaceState'];
};

export type InterfaceControllerActions =
  | CreateInterface
  | GetInterface
  | UpdateInterface
  | DeleteInterface
  | UpdateInterfaceState;

export type InterfaceControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  InterfaceControllerActions,
  never,
  InterfaceControllerActions['type'],
  never
>;

export type StoredInterface = {
  snapId: string;
  content: Component;
  state: InterfaceState;
  usage?: string;
};

export type InterfaceControllerState = {
  interfaces: Record<string, StoredInterface>;
};

export type InterfaceControllerArgs = {
  messenger: InterfaceControllerMessenger;
  state?: InterfaceControllerState;
};

/**
 * Use this controller to manage snaps UI interfaces using RPC method hooks.
 */
export class InterfaceController extends BaseController<
  typeof controllerName,
  InterfaceControllerState,
  InterfaceControllerMessenger
> {
  constructor({ messenger, state }: InterfaceControllerArgs) {
    super({
      messenger,
      metadata: {
        interfaces: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: { interfaces: {}, ...state },
    });

    this.#registerMessageHandlers();
  }

  /**
   * Constructor helper for registering this controller's messaging system
   * actions.
   */
  #registerMessageHandlers() {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:createInterface`,
      this.createInterface.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getInterface`,
      this.getInterface.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateInterface`,
      this.updateInterface.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:deleteInterface`,
      this.deleteInterface.bind(this),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateInterfaceState`,
      this.updateInterfaceState.bind(this),
    );
  }

  /**
   * Creates an interface in the controller state with the associated data.
   *
   * @param snapId - The snap id that created the interface.
   * @param content - The interface content.
   * @returns The newly interface id.
   */
  createInterface(snapId: string, content: Component) {
    const id = nanoid();

    const componentState = constructState({}, content);

    this.update((draftState) => {
      draftState.interfaces[id] = {
        snapId,
        content,
        state: componentState,
      };
    });

    return id;
  }

  /**
   * Get the data of a given interface id.
   *
   * @param snapId - The snap id requesting the interface data.
   * @param id - The interface id.
   * @returns The interface state.
   */
  getInterface(snapId: string, id: string) {
    this.#validateArgs(snapId, id);

    return this.state.interfaces[id];
  }

  /**
   * Updates the interface with the given content.
   *
   * @param snapId - The snap id requesting the update.
   * @param id - The interface id.
   * @param content - The new content.
   * @returns Null.
   */
  updateInterface(snapId: string, id: string, content: Component) {
    this.#validateArgs(snapId, id);

    const oldState = this.state.interfaces[id].state;

    const newState = constructState(oldState, content);

    this.update((draftState) => {
      draftState.interfaces[id].state = newState;
      draftState.interfaces[id].content = content;
    });

    return null;
  }

  /**
   * Deletes an interface from state.
   *
   * @param id - The interface id.
   */
  deleteInterface(id: string) {
    this.update((draftState) => {
      delete draftState.interfaces[id];
    });
  }

  /**
   * Updates the interface state.
   *
   * @param id - The interface id.
   * @param state - The new state.
   */
  updateInterfaceState(id: string, state: InterfaceState) {
    this.update((draftState) => {
      draftState.interfaces[id].state = state;
    });
  }

  /**
   * Utility function to validate the args passed to the other methods.
   *
   * @param snapId - The snap id.
   * @param id - The interface id.
   */
  #validateArgs(snapId: string, id: string) {
    const existingInterface = this.state.interfaces[id];

    assert(
      existingInterface !== undefined,
      `Interface with id '${id}' not found.`,
    );
    assert(
      existingInterface.snapId === snapId,
      `Interface not created by ${snapId}.`,
    );
  }
}
