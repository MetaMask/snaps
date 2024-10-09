import type {
  RestrictedControllerMessenger,
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { GetPermissions } from '@metamask/permission-controller';

import type { DeleteInterface } from '../interface';
import type { GetAllSnaps, HandleSnapRequest } from '../snaps';
import type {
  TransactionControllerUnapprovedTransactionAddedEvent,
  SignatureStateChange,
  TransactionControllerTransactionStatusUpdatedEvent,
} from '../types';

const controllerName = 'DeviceController';

export type DeviceControllerAllowedActions =
  | HandleSnapRequest
  | GetAllSnaps
  | GetPermissions
  | DeleteInterface;

export type DeviceControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  DeviceControllerState
>;

export type DeviceControllerActions = DeviceControllerGetStateAction;

export type DeviceControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  DeviceControllerState
>;

export type DeviceControllerEvents = DeviceControllerStateChangeEvent;

export type DeviceControllerAllowedEvents =
  | TransactionControllerUnapprovedTransactionAddedEvent
  | TransactionControllerTransactionStatusUpdatedEvent
  | SignatureStateChange;

export type DeviceControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  DeviceControllerActions | DeviceControllerAllowedActions,
  DeviceControllerEvents | DeviceControllerAllowedEvents,
  DeviceControllerAllowedActions['type'],
  DeviceControllerAllowedEvents['type']
>;

export type Device = {};

export type DeviceControllerState = {
  devices: Record<string, Device>;
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
  constructor({ messenger, state }: DeviceControllerArgs) {
    super({
      messenger,
      metadata: {
        devices: { persist: true, anonymous: false },
      },
      name: controllerName,
      state: { ...state, devices: {} },
    });
  }

  async requestDevices() {
    const devices = await (navigator as any).hid.requestDevice({ filters: [] });
    return devices;
  }

  async getDevices() {
    const devices = await (navigator as any).hid.getDevices();
    return devices;
  }
}
