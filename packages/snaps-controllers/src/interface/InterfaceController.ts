import {
  AcceptRequest,
  AddApprovalRequest,
  UpdateRequestState,
} from '@metamask/approval-controller';
import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import { Component } from '@metamask/snaps-ui';
import { Json, assert } from '@metamask/utils';
import { nanoid } from 'nanoid';

import { ComponentState, constructState } from './utils';

const controllerName = 'InterfaceController';

type AllowedActions = AddApprovalRequest | UpdateRequestState | AcceptRequest;

export type InterfaceControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  AllowedActions,
  never,
  AllowedActions['type'],
  never
>;

export type StoredInterface = {
  snapId: string;
  content: Component;
  state: ComponentState;
};

export type InterfaceControllerState = {
  interfaces: Record<string, StoredInterface>;
};

export type InterfaceControllerArgs = {
  messenger: InterfaceControllerMessenger;
  state?: InterfaceControllerState;
};

const INTERFACE_APPROVAL_TYPE = 'snap_interface';

export class InterfaceController extends BaseController<
  typeof controllerName,
  InterfaceControllerState,
  InterfaceControllerMessenger
> {
  #interfacePromises: Map<string, Promise<unknown>>;

  constructor({ messenger, state }: InterfaceControllerArgs) {
    super({
      messenger,
      metadata: {
        interfaces: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: { interfaces: {}, ...state },
    });

    this.#interfacePromises = new Map();
  }

  showInterface(snapId: string, content: Component) {
    const id = nanoid();

    const componentState = constructState({}, content);

    const approval = this.messagingSystem.call(
      'ApprovalController:addRequest',
      {
        origin: snapId,
        id,
        type: INTERFACE_APPROVAL_TYPE,
        requestData: {},
        requestState: {
          content,
          state: componentState,
        },
      },
      true,
    );

    this.update((draftState) => {
      draftState.interfaces[id] = {
        snapId,
        content,
        state: componentState,
      };
    });

    this.#interfacePromises.set(id, approval);

    return id;
  }

  updateInterface(snapId: string, id: string, content: Component) {
    this.#validateArgs(snapId, id);

    const oldState = this.state.interfaces[id].state;

    const componentState = constructState({}, content);

    const newState = { ...componentState, ...oldState };

    this.messagingSystem.call('ApprovalController:updateRequestState', {
      id,
      requestState: { content, state: newState },
    });

    this.update((draftState) => {
      draftState.interfaces[id].state = newState;
    });

    return null;
  }

  async resolveInterface(snapId: string, id: string, value: Json) {
    this.#validateArgs(snapId, id);

    await this.messagingSystem.call(
      'ApprovalController:acceptRequest',
      id,
      value,
    );

    this.#interfacePromises.delete(id);
    this.update((draftState) => {
      delete draftState.interfaces[id];
    });

    return null;
  }

  async readInterface(snapId: string, id: string) {
    this.#validateArgs(snapId, id);

    return this.#interfacePromises.get(id);
  }

  updateInterfaceState(id: string, state: ComponentState) {
    this.update((draftState) => {
      draftState.interfaces[id].state = state;
    });
  }

  #validateArgs(snapId: string, id: string) {
    const existingInterface = this.state.interfaces[id];

    assert(
      existingInterface !== undefined,
      `Interface with id '${id}' not found.`,
    );
    assert(
      existingInterface.snapId === snapId,
      `Interface not created by ${snapId}`,
    );
  }
}
