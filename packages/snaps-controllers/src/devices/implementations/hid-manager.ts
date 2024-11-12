import type { DeviceId } from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';

import type { DeviceManager } from './device-manager';
import { HIDSnapDevice } from './hid';

export class HIDManager implements DeviceManager {
  constructor() {
    navigator.hid.addEventListener('connect', (event) => {
      // eslint-disable-next-line no-console
      console.log('HID device connected:', event.device);
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      // eslint-disable-next-line no-console
      console.log('HID device disconnected:', event.device);
    });
  }

  async request() {
    const [device] = await navigator.hid.requestDevice();

    if (!device) {
      throw new Error('No device selected.');
    }

    return new HIDSnapDevice(
      `${DeviceType.HID}:${device.vendorId.toString(
        16,
      )}:${device.productId.toString(16)}`,
      device,
    );
  }

  async connect(id: DeviceId) {
    const [, vendorId, productId] = id
      .split(':')
      .map((part) => parseInt(part, 16));

    const devices = await navigator.hid.getDevices();
    const device = devices.find(
      (hidDevice) =>
        hidDevice.vendorId === vendorId && hidDevice.productId === productId,
    );

    if (!device) {
      throw new Error('Device not found.');
    }

    return new HIDSnapDevice(id, device);
  }
}
