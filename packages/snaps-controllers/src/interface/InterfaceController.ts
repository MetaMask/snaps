import type {
  AcceptRequest,
  AddApprovalRequest,
  UpdateRequestState,
} from '@metamask/approval-controller';
import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { Component } from '@metamask/snaps-sdk';
import type { InterfaceState } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { nanoid } from 'nanoid';

import { constructState } from './utils';

const controllerName = 'InterfaceController';

// @TODO: Add actions for functions

export type AllowedInterfaceControllerActions =
  | AddApprovalRequest
  | UpdateRequestState
  | AcceptRequest;

export type InterfaceControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  AllowedInterfaceControllerActions,
  never,
  AllowedInterfaceControllerActions['type'],
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
  }

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

  getInterfaceContent(snapId: string, id: string) {
    this.#validateArgs(snapId, id);

    return this.state.interfaces[id].content;
  }

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

  deleteInterface(id: string) {
    this.update((draftState) => {
      delete draftState.interfaces[id];
    });
  }

  updateInterfaceState(id: string, state: InterfaceState) {
    this.update((draftState) => {
      draftState.interfaces[id].state = state;
    });
  }

  getInterfaceState(snapId: string, id: string) {
    this.#validateArgs(snapId, id);

    return this.state.interfaces[id].state;
  }

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
