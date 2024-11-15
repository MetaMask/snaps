import type { DeviceMetadata, DeviceId } from '@metamask/snaps-sdk';

import { TypedEventEmitter } from '../../types';
import type { Device } from './device';

/**
 * The events that a `DeviceManager` can emit.
 */
export type DeviceManagerEvents = {
  /**
   * Emitted when a device is connected.
   *
   * @param device - The device that is connected.
   */
  connect: (device: Device) => void;

  /**
   * Emitted when a device is disconnected.
   *
   * @param deviceId - The ID of the device that is disconnected.
   */
  disconnect: (deviceId: DeviceId) => void;
};

// This is an abstract class to allow for extending `TypedEventEmitter`.
export abstract class DeviceManager extends TypedEventEmitter<DeviceManagerEvents> {
  /**
   * Synchronize the state with the current devices. This returns the current
   * list of devices.
   */
  abstract getDeviceMetadata(): Promise<DeviceMetadata[]>;

  /**
   * Get a device by its ID.
   *
   * @param deviceId - The ID of the device to get.
   * @returns The device, or `undefined` if the device is not found.
   */
  abstract getDevice(deviceId: DeviceId): Promise<Device | undefined>;
}
