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
  Device,
  DeviceFilter,
  DeviceId,
  ListDevicesParams,
  ReadDeviceParams,
  RequestDeviceParams,
  SnapId,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';
import { assert, createDeferredPromise, hasProperty } from '@metamask/utils';

import type { SnapDevice } from './implementations/device';

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

export type ConnectedDevice = {
  reference: any; // TODO: Type this
  metadata: Device;
};

export type DeviceControllerState = {
  devices: Record<string, Device>;
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

  #devices: Record<DeviceId, SnapDevice> = {};

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
  }

  async requestDevice(snapId: string, { type, filters }: RequestDeviceParams) {
    const deviceId = await this.#requestPairing({
      snapId,
      type: type as DeviceType,
      filters,
    });

    // await this.#syncDevices();

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

    // TODO: Can a paired device by not connected?
    const device = await this.#getConnectedDeviceById(deviceId);
    return device.metadata;
  }

  async writeDevice(snapId: SnapId, params: WriteDeviceParams) {
    const { id } = params;
    if (!this.#hasPermission(snapId, id)) {
      // TODO: Decide on error message
      throw rpcErrors.invalidParams();
    }

    const device = this.#devices[id];
    assert(device, 'Device not found.');

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

    return await device.read(params);
  }

  async listDevices(snapId: SnapId, { type }: ListDevicesParams) {
    await this.#syncDevices();

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

  async #syncDevices() {
    const connectedDevices = await this.#getConnectedDevices();

    this.update((draftState) => {
      for (const device of Object.values(draftState.devices)) {
        draftState.devices[device.id].available = hasProperty(
          connectedDevices,
          device.id,
        );
      }
      for (const device of Object.values(connectedDevices)) {
        if (!hasProperty(draftState.devices, device.metadata.id)) {
          // @ts-expect-error Not sure why this is failing, continuing.
          draftState.devices[device.metadata.id] = device.metadata;
        }
      }
    });
  }

  // Get actually connected devices
  async #getConnectedDevices(): Promise<Record<string, ConnectedDevice>> {
    const type = DeviceType.HID;
    // TODO: Merge multiple device implementations
    const devices: any[] = await (navigator as any).hid.getDevices();
    return devices.reduce<Record<string, ConnectedDevice>>(
      (accumulator, device) => {
        const { vendorId, productId, productName } = device;

        const id = `${type}:${vendorId}:${productId}` as DeviceId;

        // TODO: Figure out what to do about duplicates.
        accumulator[id] = {
          reference: device,
          metadata: {
            type,
            id,
            name: productName,
            vendorId,
            productId,
            available: true,
          },
        };

        return accumulator;
      },
      {},
    );
  }

  async #getConnectedDeviceById(id: DeviceId) {
    const devices = await this.#getConnectedDevices();
    return devices[id];
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

    // TODO: Consider polling this call while pairing is ongoing?
    await this.#syncDevices();

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
}
