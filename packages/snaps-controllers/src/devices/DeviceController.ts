import type {
  RestrictedControllerMessenger,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type {
  GetPermissions,
  GrantPermissionsIncremental,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  SnapCaveatType,
  SnapEndowments,
  getPermittedDeviceIds,
} from '@metamask/snaps-rpc-methods';
import type {
  DeviceId,
  ListDevicesParams,
  ReadDeviceParams,
  SnapId,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import {
  add0x,
  createDeferredPromise,
  hasProperty,
  Hex,
  hexToBytes,
} from '@metamask/utils';

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

export enum DeviceType {
  HID = 'hid',
}

export type DeviceMetadata = {
  type: DeviceType;
  id: DeviceId;
  name: string;
};

export type Device = DeviceMetadata & {
  connected: boolean;
};

export type ConnectedDevice = {
  reference: any; // TODO: Type this
  metadata: DeviceMetadata;
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
    promise: Promise<DeviceId>;
    resolve: (result: DeviceId) => void;
    reject: (error: unknown) => void;
  };

  #openDevices: Record<
    DeviceId,
    {
      buffer: { reportId: number; data: Hex }[];
      promise?: Promise<{ reportId: number; data: Hex }>;
      resolvePromise?: any;
    }
  > = {};

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

  async requestDevice(snapId: string) {
    const deviceId = await this.#requestPairing({ snapId });

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

  // TODO: Clean up
  async #openDevice(id: DeviceId, device: any) {
    await device.open();

    if (!this.#openDevices[id]) {
      this.#openDevices[id] = {
        buffer: [],
      };
    }

    device.addEventListener('inputreport', (event: any) => {
      const promiseResolve = this.#openDevices[id].resolvePromise;

      const data = add0x(Buffer.from(event.data.buffer).toString('hex')) as Hex;

      const result = {
        reportId: event.reportId,
        data,
      };

      if (promiseResolve) {
        promiseResolve(result);
        delete this.#openDevices[id].resolvePromise;
        delete this.#openDevices[id].promise;
      } else {
        this.#openDevices[id].buffer.push(result);
      }
    });
  }

  #waitForNextRead(id: DeviceId) {
    if (this.#openDevices[id].promise) {
      return this.#openDevices[id].promise;
    }

    const { promise, resolve } = createDeferredPromise<{
      reportId: number;
      data: Hex;
    }>();

    this.#openDevices[id].resolvePromise = resolve;
    this.#openDevices[id].promise = promise;
    return promise;
  }

  async writeDevice(
    snapId: SnapId,
    { id, reportId = 0, reportType, data }: WriteDeviceParams,
  ) {
    if (!this.#hasPermission(snapId, id)) {
      // TODO: Decide on error message
      throw rpcErrors.invalidParams();
    }

    const device = await this.#getConnectedDeviceById(id);
    if (!device) {
      // Handle
    }

    const actualDevice = device.reference;

    if (!actualDevice.opened) {
      await this.#openDevice(id, actualDevice);
    }

    if (reportType === 'feature') {
      await actualDevice.sendFeatureReport(reportId, hexToBytes(data));
    } else {
      await actualDevice.sendReport(reportId, hexToBytes(data));
    }

    return null;
  }

  async readDevice(
    snapId: SnapId,
    { id, reportId = 0, reportType }: ReadDeviceParams,
  ) {
    if (!this.#hasPermission(snapId, id)) {
      // TODO: Decide on error message
      throw rpcErrors.invalidParams();
    }

    const device = await this.#getConnectedDeviceById(id);
    if (!device) {
      // Handle
    }

    const actualDevice = device.reference;

    if (!actualDevice.opened) {
      await this.#openDevice(id, actualDevice);
    }

    if (reportType === 'feature') {
      return actualDevice.receiveFeatureReport(reportId);
    } else {
      // TODO: Deal with report IDs?
      // TODO: Clean up
      if (this.#openDevices[id].buffer.length > 0) {
        const result = this.#openDevices[id].buffer.shift();
        return result!.data;
      } else {
        const result = await this.#waitForNextRead(id);
        return result!.data;
      }
    }
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
        draftState.devices[device.id].connected = hasProperty(
          connectedDevices,
          device.id,
        );
      }
      for (const device of Object.values(connectedDevices)) {
        if (!hasProperty(draftState.devices, device.metadata.id)) {
          // @ts-expect-error Not sure why this is failing, continuing.
          draftState.devices[device.metadata.id] = {
            ...device.metadata,
            connected: true,
          };
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
          metadata: { type, id, name: productName },
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

  async #requestPairing({ snapId }: { snapId: string }) {
    if (this.#isPairing()) {
      // TODO: Potentially await existing pairing flow?
      throw new Error('A pairing is already underway.');
    }

    const { promise, resolve, reject } = createDeferredPromise<DeviceId>();

    this.#pairing = { promise, resolve, reject };

    // TODO: Consider polling this call while pairing is ongoing?
    await this.#syncDevices();

    this.update((draftState) => {
      draftState.pairing = { snapId };
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
