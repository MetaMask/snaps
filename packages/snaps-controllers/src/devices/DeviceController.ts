import type {
  ControllerGetStateAction,
  ControllerStateChangeEvent,
  RestrictedControllerMessenger,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type {
  GetPermissions,
  GrantPermissionsIncremental,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  getPermittedDeviceIds,
  SnapCaveatType,
  SnapEndowments,
} from '@metamask/snaps-rpc-methods';
import type {
  DeviceMetadata,
  DeviceFilter,
  DeviceId,
  ListDevicesParams,
  ReadDeviceParams,
  RequestDeviceParams,
  SnapId,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';
import { logError } from '@metamask/snaps-utils';
import { assert, createDeferredPromise, hasProperty } from '@metamask/utils';

import { HIDManager } from './implementations';
import type { SnapDevice } from './implementations/device';
import type { DeviceManager } from './implementations/device-manager';

const controllerName = 'DeviceController';

export type DeviceControllerAllowedActions =
  | GetPermissions
  | GrantPermissionsIncremental;

export type DeviceControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  DeviceControllerState
>;

export type DeviceControllerRequestDeviceAction = {
  type: `${typeof controllerName}:requestDevice`;
  handler: DeviceController['requestDevice'];
};

export type DeviceControllerListDevicesAction = {
  type: `${typeof controllerName}:listDevices`;
  handler: DeviceController['listDevices'];
};

export type DeviceControllerReadDeviceAction = {
  type: `${typeof controllerName}:readDevice`;
  handler: DeviceController['readDevice'];
};

export type DeviceControllerWriteDeviceAction = {
  type: `${typeof controllerName}:writeDevice`;
  handler: DeviceController['writeDevice'];
};

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
  | DeviceControllerRejectPairingAction
  | DeviceControllerRequestDeviceAction
  | DeviceControllerListDevicesAction
  | DeviceControllerWriteDeviceAction
  | DeviceControllerReadDeviceAction;

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

export type DeviceControllerState = {
  devices: Record<string, DeviceMetadata>;
  pairing: {
    snapId: string;
    type: DeviceType;
    filters?: DeviceFilter[];
  } | null;
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
    promise: Promise<DeviceId>;
    resolve: (result: DeviceId) => void;
    reject: (error: unknown) => void;
  };

  #managers: Record<DeviceType, DeviceManager> = {
    [DeviceType.HID]: new HIDManager(),
  };

  #devices: Record<DeviceId, SnapDevice> = {};

  constructor({ messenger, state }: DeviceControllerArgs) {
    super({
      messenger,
      metadata: {
        devices: { persist: true, anonymous: false },
        pairing: { persist: false, anonymous: false },
      },
      name: controllerName,
      state: { devices: {}, pairing: null, ...state },
    });

    this.messagingSystem.registerActionHandler(
      `${controllerName}:requestDevice`,
      async (...args) => this.requestDevice(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:listDevices`,
      async (...args) => this.listDevices(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:writeDevice`,
      async (...args) => this.writeDevice(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:readDevice`,
      async (...args) => this.readDevice(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:resolvePairing`,
      async (...args) => this.resolvePairing(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:rejectPairing`,
      async (...args) => this.rejectPairing(...args),
    );

    for (const manager of Object.values(this.#managers)) {
      manager.on('connect', (device) => {
        this.#addDevice(device);
      });

      manager.on('disconnect', (id) => {
        this.#removeDevice(id);
      });

      this.#synchronize(manager).catch((error) => {
        logError('Failed to synchronize device manager.', error);
      });
    }
  }

  async requestDevice(snapId: string, { type, filters }: RequestDeviceParams) {
    const deviceId = await this.#requestPairing({
      snapId,
      type: type as DeviceType,
      filters,
    });

    // TODO: Figure out how to revoke these permissions again?
    this.messagingSystem.call(
      'PermissionController:grantPermissionsIncremental',
      {
        subject: { origin: snapId },
        approvedPermissions: {
          // TODO: Consider this format
          [SnapEndowments.Devices]: {
            caveats: [
              {
                type: SnapCaveatType.DeviceIds,
                value: { devices: [{ deviceId }] },
              },
            ],
          },
        },
      },
    );

    await this.#synchronize(this.#managers[type]);

    // TODO: Can a paired device be not connected?
    return this.state.devices[deviceId];
  }

  async writeDevice(snapId: SnapId, params: WriteDeviceParams) {
    const { id } = params;
    if (!this.#hasPermission(snapId, id)) {
      // TODO: Decide on error message
      throw rpcErrors.invalidParams();
    }

    const device = this.#devices[id];
    assert(device, 'Device not found.');

    await this.#openDevice(id);
    await device.write(params);

    return null;
  }

  async readDevice(snapId: SnapId, params: ReadDeviceParams) {
    const { id } = params;
    if (!this.#hasPermission(snapId, id)) {
      // TODO: Decide on error message
      throw rpcErrors.invalidParams();
    }

    const device = this.#devices[id];
    assert(device, 'Device not found.');

    await this.#openDevice(id);
    return await device.read(params);
  }

  async listDevices(snapId: SnapId, { type }: ListDevicesParams) {
    const permittedDevices = this.#getPermittedDevices(snapId);
    const deviceData = permittedDevices.map(
      (device) => this.state.devices[device.deviceId],
    );

    if (type) {
      const types = Array.isArray(type) ? type : [type];
      return deviceData.filter((device) => types.includes(device.type));
    }

    return deviceData;
  }

  #getPermittedDevices(snapId: SnapId) {
    const permissions = this.messagingSystem.call(
      'PermissionController:getPermissions',
      snapId,
    );

    if (!permissions || !hasProperty(permissions, SnapEndowments.Devices)) {
      return [];
    }

    const permission = permissions[SnapEndowments.Devices];
    const devices = getPermittedDeviceIds(permission);
    return devices ?? [];
  }

  #hasPermission(snapId: SnapId, deviceId: DeviceId) {
    const devices = this.#getPermittedDevices(snapId);
    return devices.some(
      (permittedDevice) => permittedDevice.deviceId === deviceId,
    );
  }

  #isPairing() {
    return this.#pairing !== undefined;
  }

  async #requestPairing({
    snapId,
    type,
    filters,
  }: {
    snapId: string;
    type: DeviceType;
    filters?: DeviceFilter[];
  }) {
    if (this.#isPairing()) {
      // TODO: Potentially await existing pairing flow?
      throw new Error('A pairing is already underway.');
    }

    const { promise, resolve, reject } = createDeferredPromise<DeviceId>();

    this.#pairing = { promise, resolve, reject };

    this.update((draftState) => {
      draftState.pairing = { snapId, type, filters };
    });

    return promise;
  }

  resolvePairing(deviceId: DeviceId) {
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

  /**
   * Open a device, and set a timeout to close it if it is not used.
   *
   * @param id - The ID of the device to open.
   * @returns A promise that resolves when the device is opened.
   */
  async #openDevice(id: DeviceId) {
    const device = this.#devices[id];
    assert(device, 'Device not found.');

    await device.open();
  }

  /**
   * Close a device.
   *
   * @param id - The ID of the device to close.
   * @returns A promise that resolves when the device is closed.
   */
  async #closeDevice(id: DeviceId) {
    const device = this.#devices[id];
    assert(device, 'Device not found.');

    await device.close();
  }

  /**
   * Synchronize the state of the controller with the state of the device
   * manager.
   *
   * @param manager - The device manager to synchronize with.
   */
  async #synchronize(manager: DeviceManager) {
    const metadata = await manager.getDeviceMetadata();
    for (const device of metadata) {
      if (!this.state.devices[device.id]) {
        this.update((draftState) => {
          draftState.devices[device.id] = device;
        });
      }

      if (!this.#devices[device.id]) {
        const deviceImplementation = await manager.getDevice(device.id);
        if (deviceImplementation) {
          this.#addDevice(deviceImplementation);
        }
      }
    }
  }

  /**
   * Add a device to the controller.
   *
   * @param device - The device to add.
   */
  #addDevice(device: SnapDevice) {
    this.#devices[device.id] = device;

    if (this.state.devices[device.id]) {
      this.update((draftState) => {
        draftState.devices[device.id].available = true;
      });
    }
  }

  /**
   * Remove a device from the controller.
   *
   * @param id - The ID of the device to remove.
   */
  #removeDevice(id: DeviceId) {
    delete this.#devices[id];

    if (this.state.devices[id]) {
      this.update((draftState) => {
        draftState.devices[id].available = false;
      });
    }
  }
}
