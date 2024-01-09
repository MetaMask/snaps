import type {
  AcceptRequest,
  AddApprovalRequest,
  UpdateRequestState,
} from '@metamask/approval-controller';
import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { Component } from '@metamask/snaps-sdk';
import type { InterfaceState } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import { assert } from '@metamask/utils';
import { nanoid } from 'nanoid';

import { constructState } from './utils';

const controllerName = 'InterfaceController';

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

export const INTERFACE_APPROVAL_TYPE = 'snap_interface';

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

  getInterfaceContent(snapId: string, id: string, usage: string) {
    this.#validateArgs(snapId, id);

    this.update((draftState) => {
      draftState.interfaces[id] = {
        ...draftState.interfaces[id],
        usage,
      };
    });

    return this.state.interfaces[id].content;
  }

  updateInterface(snapId: string, id: string, content: Component) {
    this.#validateArgs(snapId, id);

    const oldState = this.state.interfaces[id].state;

    const newState = constructState(oldState, content);

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

    const { usage } = this.state.interfaces[id];

    assert(
      usage === 'snap_dialog_custom',
      `Only interfaces used in 'snap_dialog' of type 'custom' can be resolved.`,
    );

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
