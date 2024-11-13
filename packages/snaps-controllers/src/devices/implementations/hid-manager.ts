import type { DeviceId } from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';
import { logError } from '@metamask/snaps-utils';

import { DeviceManager } from './device-manager';
import { HIDSnapDevice } from './hid';

/**
 * Get the device ID for an HID device, based on its vendor and product IDs.
 *
 * @param device - The HID device.
 * @returns The device ID.
 */
function getDeviceId(device: HIDDevice): DeviceId {
  return `${DeviceType.HID}:${device.vendorId.toString(
    16,
  )}:${device.productId.toString(16)}`;
}

/**
 * A manager for HID devices.
 */
export class HIDManager extends DeviceManager {
  constructor() {
    super();

    this.#synchronize();

    navigator.hid.addEventListener('connect', (event) => {
      const device = new HIDSnapDevice(getDeviceId(event.device), event.device);
      this.emit('connect', device);
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      this.emit('disconnect', getDeviceId(event.device));
    });
  }

  /**
   * Synchronize the state with the current HID devices. This emits a `connect`
   * event for each connected device.
   */
  #synchronize() {
    navigator.hid
      .getDevices()
      .then((devices) => {
        for (const device of devices) {
          const snapDevice = new HIDSnapDevice(getDeviceId(device), device);
          this.emit('connect', snapDevice);
        }
      })
      .catch((error) => {
        logError('Unable to synchronize HID devices:', error);
      });
  }
}
