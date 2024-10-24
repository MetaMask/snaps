import type {
  RestrictedControllerMessenger,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import { createDeferredPromise, hasProperty } from '@metamask/utils';

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
  HID = 'HID',
}

export type DeviceMetadata = {
  type: DeviceType;
  id: string;
  name: string;
};

export type Device = DeviceMetadata & {
  connected: boolean;
};

export type DeviceControllerState = {
  devices: Record<string, Device>;
  pairing: { snapId: string } | null;
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
    resolve: (result: string) => void;
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
      state: { ...state, devices: {}, pairing: null },
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
    const deviceId = await this.#requestPairing({ snapId });

    await this.#syncDevices();

    console.log('Granting access to', deviceId);

    // TODO: Grant permission to use device

    return null;
  }

  async #hasPermission(snapId: string, device: Device) {
    // TODO: Verify Snap has permission to use device.
    return true;
  }

  async #syncDevices() {
    const connectedDevices = await this.#getDevices();

    this.update((draftState) => {
      for (const device of Object.values(draftState.devices)) {
        draftState.devices[device.id].connected = hasProperty(
          connectedDevices,
          device.id,
        );
      }
      for (const device of Object.values(connectedDevices)) {
        if (!hasProperty(draftState.devices, device.id)) {
          // @ts-expect-error Not sure why this is failing, continuing.
          draftState.devices[device.id] = { ...device, connected: true };
        }
      }
    });
  }

  // Get actually connected devices
  async #getDevices(): Promise<Record<string, DeviceMetadata>> {
    const type = DeviceType.HID;
    // TODO: Merge multiple device implementations
    const devices: any[] = await (navigator as any).hid.getDevices();
    return devices.reduce<Record<string, DeviceMetadata>>(
      (accumulator, device) => {
        const { vendorId, productId, productName } = device;

        const id = `${type}-${vendorId}-${productId}`;

        accumulator[id] = { type, id, name: productName };

        return accumulator;
      },
      {},
    );
  }

  #isPairing() {
    return this.#pairing !== undefined;
  }

  async #requestPairing({ snapId }: { snapId: string }) {
    if (this.#isPairing()) {
      // TODO: Potentially await existing pairing flow?
      throw new Error('A pairing is already underway.');
    }

    const { promise, resolve, reject } = createDeferredPromise<string>();

    this.#pairing = { promise, resolve, reject };

    // TODO: Consider polling this call while pairing is ongoing?
    await this.#syncDevices();

    this.update((draftState) => {
      draftState.pairing = { snapId };
    });

    return promise;
  }

  resolvePairing(deviceId: string) {
    if (!this.#isPairing()) {
      return;
    }

    this.#pairing?.resolve(deviceId);
    this.#pairing = undefined;
    this.update((draftState) => {
      draftState.pairing = null;
    });
  }

  rejectPairing() {
    if (!this.#isPairing()) {
      return;
    }

    this.#pairing?.reject(new Error('Pairing rejected'));
    this.#pairing = undefined;
    this.update((draftState) => {
      draftState.pairing = null;
    });
  }
}
