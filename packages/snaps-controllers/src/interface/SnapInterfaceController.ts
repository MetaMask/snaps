import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type {
  MaybeUpdateState,
  TestOrigin,
} from '@metamask/phishing-controller';
import type {
  InterfaceState,
  SnapId,
  ComponentOrElement,
  InterfaceContext,
} from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import {
  getJsonSizeUnsafe,
  getJsxInterface,
  validateJsxLinks,
} from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { nanoid } from 'nanoid';

import { constructState, validateInterfaceContext } from './utils';

const MAX_UI_CONTENT_SIZE = 10_000_000; // 10 mb

const controllerName = 'SnapInterfaceController';

export type CreateInterface = {
  type: `${typeof controllerName}:createInterface`;
  handler: SnapInterfaceController['createInterface'];
};

export type GetInterface = {
  type: `${typeof controllerName}:getInterface`;
  handler: SnapInterfaceController['getInterface'];
};

export type UpdateInterface = {
  type: `${typeof controllerName}:updateInterface`;
  handler: SnapInterfaceController['updateInterface'];
};

export type DeleteInterface = {
  type: `${typeof controllerName}:deleteInterface`;
  handler: SnapInterfaceController['deleteInterface'];
};

export type UpdateInterfaceState = {
  type: `${typeof controllerName}:updateInterfaceState`;
  handler: SnapInterfaceController['updateInterfaceState'];
};

export type SnapInterfaceControllerAllowedActions =
  | TestOrigin
  | MaybeUpdateState;

export type SnapInterfaceControllerActions =
  | CreateInterface
  | GetInterface
  | UpdateInterface
  | DeleteInterface
  | UpdateInterfaceState;

export type SnapInterfaceControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapInterfaceControllerActions | SnapInterfaceControllerAllowedActions,
  never,
  SnapInterfaceControllerAllowedActions['type'],
  never
>;

export type StoredInterface = {
  snapId: SnapId;
  content: JSXElement;
  state: InterfaceState;
  context: InterfaceContext | null;
};

export type SnapInterfaceControllerState = {
  interfaces: Record<string, StoredInterface>;
};

export type SnapInterfaceControllerArgs = {
  messenger: SnapInterfaceControllerMessenger;
  state?: SnapInterfaceControllerState;
};

/**
 * Use this controller to manage snaps UI interfaces using RPC method hooks.
 */
export class SnapInterfaceController extends BaseController<
  typeof controllerName,
  SnapInterfaceControllerState,
  SnapInterfaceControllerMessenger
> {
  constructor({ messenger, state }: SnapInterfaceControllerArgs) {
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
   * Create an interface in the controller state with the associated data.
   *
   * @param snapId - The snap id that created the interface.
   * @param content - The interface content.
   * @param context - An optional interface context object.
   * @returns The newly interface id.
   */
  async createInterface(
    snapId: SnapId,
    content: ComponentOrElement,
    context?: InterfaceContext,
  ) {
    const element = getJsxInterface(content);
    await this.#validateContent(element);
    validateInterfaceContext(context);

    const id = nanoid();
    const componentState = constructState({}, element);

    this.update((draftState) => {
      // @ts-expect-error - TS2589: Type instantiation is excessively deep and
      // possibly infinite.
      draftState.interfaces[id] = {
        snapId,
        content: element,
        state: componentState,
        context: context ?? null,
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
  getInterface(snapId: SnapId, id: string) {
    this.#validateArgs(snapId, id);

    return this.state.interfaces[id];
  }

  /**
   * Update the interface with the given content.
   *
   * @param snapId - The snap id requesting the update.
   * @param id - The interface id.
   * @param content - The new content.
   */
  async updateInterface(
    snapId: SnapId,
    id: string,
    content: ComponentOrElement,
  ) {
    this.#validateArgs(snapId, id);
    const element = getJsxInterface(content);
    await this.#validateContent(element);

    const oldState = this.state.interfaces[id].state;
    const newState = constructState(oldState, element);

    this.update((draftState) => {
      draftState.interfaces[id].state = newState;
      draftState.interfaces[id].content = element;
    });
  }

  /**
   * Delete an interface from state.
   *
   * @param id - The interface id.
   */
  deleteInterface(id: string) {
    this.update((draftState) => {
      delete draftState.interfaces[id];
    });
  }

  /**
   * Update the interface state.
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
  #validateArgs(snapId: SnapId, id: string) {
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

  /**
   * Trigger a Phishing list update if needed.
   */
  async #triggerPhishingListUpdate() {
    await this.messagingSystem.call('PhishingController:maybeUpdateState');
  }

  /**
   * Check an origin against the phishing list.
   *
   * @param origin - The origin to check.
   * @returns True if the origin is on the phishing list, otherwise false.
   */
  #checkPhishingList(origin: string) {
    return this.messagingSystem.call('PhishingController:testOrigin', origin)
      .result;
  }

  /**
   * Utility function to validate the components of an interface.
   * Throws if something is invalid.
   *
   * @param element - The JSX element to verify.
   */
  async #validateContent(element: JSXElement) {
    // We assume the validity of this JSON to be validated by the caller.
    // E.g., in the RPC method implementation.
    const size = getJsonSizeUnsafe(element);
    assert(
      size <= MAX_UI_CONTENT_SIZE,
      `A Snap UI may not be larger than ${MAX_UI_CONTENT_SIZE / 1000000} MB.`,
    );

    await this.#triggerPhishingListUpdate();
    validateJsxLinks(element, this.#checkPhishingList.bind(this));
  }
}
