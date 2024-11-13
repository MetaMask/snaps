import type { DeviceId } from '@metamask/snaps-sdk';

import { TypedEventEmitter } from '../../types';
import type { SnapDevice } from './device';

/**
 * The events that a `DeviceManager` can emit.
 */
export type DeviceManagerEvents = {
  /**
   * Emitted when a device is connected.
   *
   * @param device - The device that is connected.
   */
  connect: (device: SnapDevice) => void;

  /**
   * Emitted when a device is disconnected.
   *
   * @param deviceId - The ID of the device that is disconnected.
   */
  disconnect: (deviceId: DeviceId) => void;
};

// This is an abstract class to allow for extending `TypedEventEmitter`.
export abstract class DeviceManager extends TypedEventEmitter<DeviceManagerEvents> {}
