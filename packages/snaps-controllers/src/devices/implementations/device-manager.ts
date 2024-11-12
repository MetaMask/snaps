import type { DeviceId } from '@metamask/snaps-sdk';

import type { SnapDevice } from './device';

export interface DeviceManager {
  /**
   * Request a new HID device.
   *
   * @returns The connected device.
   */
  request(): Promise<SnapDevice>;

  /**
   * Connect to an existing HID device.
   *
   * @param id - The device ID to connect to.
   * @returns The connected device.
   * @throws An error if the device is not found.
   */
  connect(id: DeviceId): Promise<SnapDevice>;
}
