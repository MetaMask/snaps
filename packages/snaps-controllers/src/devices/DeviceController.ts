import type {
  RestrictedControllerMessenger,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import { createDeferredPromise } from '@metamask/utils';

const controllerName = 'DeviceController';

export type DeviceControllerAllowedActions = never;

export type DeviceControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  DeviceControllerState
>;

export type DeviceControllerResolvePairingAction = {
  type: `${typeof controllerName}:resolvePairing`;
  handler: DeviceController['resolvePairing'];
};

export type DeviceControllerRejectPairingAction = {
  type: `${typeof controllerName}:rejectPairing`;
  handler: DeviceController['rejectPairing'];
};

export type DeviceControllerActions =
  | DeviceControllerGetStateAction
  | DeviceControllerResolvePairingAction
  | DeviceControllerRejectPairingAction;

export type DeviceControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  DeviceControllerState
>;

export type DeviceControllerEvents = DeviceControllerStateChangeEvent;

export type DeviceControllerAllowedEvents = never;

export type DeviceControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  DeviceControllerActions | DeviceControllerAllowedActions,
  DeviceControllerEvents | DeviceControllerAllowedEvents,
  DeviceControllerAllowedActions['type'],
  DeviceControllerAllowedEvents['type']
>;

export enum DeviceType {
  HID,
  Bluetooth,
}

export type Device = {
  type: DeviceType;
};

export type DeviceControllerState = {
  devices: Record<string, Device>;
  pairing?: { snapId: string };
};

export type DeviceControllerArgs = {
  messenger: DeviceControllerMessenger;
  state?: DeviceControllerState;
};
/**
 * Controller for managing access to devices for Snaps.
 */
export class DeviceController extends BaseController<
  typeof controllerName,
  DeviceControllerState,
  DeviceControllerMessenger
> {
  #pairing?: {
    promise: Promise<unknown>;
    resolve: (result: unknown) => void;
    reject: (error: unknown) => void;
  };

  constructor({ messenger, state }: DeviceControllerArgs) {
    super({
      messenger,
      metadata: {
        devices: { persist: true, anonymous: false },
        pairing: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: { ...state, devices: {} },
    });

    this.messagingSystem.registerActionHandler(
      `${controllerName}:resolvePairing`,
      async (...args) => this.resolvePairing(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:rejectPairing`,
      async (...args) => this.rejectPairing(...args),
    );
  }

  async requestDevices(snapId: string) {
    const device = await this.#requestPairing({ snapId });

    console.log('Paired device', device);
    // TODO: Persist device
    // TODO: Grant permission to use device
  }

  async #hasPermission(snapId: string, device: Device) {
    // TODO: Verify Snap has permission to use device.
    return true;
  }

  // Get actually connected devices
  async #getDevices() {
    // TODO: Merge multiple device implementations
    return (navigator as any).hid.getDevices();
  }

  #isPairing() {
    return this.#pairing !== undefined;
  }

  async #requestPairing({ snapId }: { snapId: string }) {
    if (this.#isPairing()) {
      // TODO: Potentially await existing pairing flow?
      throw new Error('A pairing is already underway.');
    }

    const { promise, resolve, reject } = createDeferredPromise<unknown>();

    this.#pairing = { promise, resolve, reject };
    this.update((draftState) => {
      draftState.pairing = { snapId };
    });

    return promise;
  }

  resolvePairing(device: unknown) {
    if (!this.#isPairing()) {
      return;
    }

    this.#pairing?.resolve(device);
    this.update((draftState) => {
      delete draftState.pairing;
    });
  }

  rejectPairing() {
    if (!this.#isPairing()) {
      return;
    }

    this.#pairing?.reject(new Error('Pairing rejected'));
    this.update((draftState) => {
      delete draftState.pairing;
    });
  }
}
