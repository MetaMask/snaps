import type { DeviceId } from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';

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

    navigator.hid.addEventListener('connect', (event) => {
      const device = new HIDSnapDevice(getDeviceId(event.device), event.device);
      this.emit('connect', device);
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      this.emit('disconnect', getDeviceId(event.device));
    });
  }

  /**
   * Get the device IDs for the currently connected HID devices.
   *
   * @returns The device IDs.
   */
  async getDeviceMetadata() {
    const devices = await navigator.hid.getDevices();
    return devices.map((device) => ({
      type: DeviceType.HID,
      id: getDeviceId(device),
      name: device.productName,
      vendorId: device.vendorId,
      productId: device.productId,
      available: true,
    }));
  }

  /**
   * Get a device by its ID.
   *
   * @param deviceId - The ID of the device to get.
   * @returns The device, or `undefined` if the device is not found.
   */
  async getDevice(deviceId: DeviceId) {
    const devices = await navigator.hid.getDevices();
    const device = devices.find((item) => getDeviceId(item) === deviceId);

    if (device) {
      return new HIDSnapDevice(deviceId, device);
    }

    return undefined;
  }
}
