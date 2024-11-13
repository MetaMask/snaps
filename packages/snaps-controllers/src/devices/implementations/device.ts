import type {
  DeviceId,
  DeviceType,
  ReadDeviceParams,
  ReadDeviceResult,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import type { Hex } from '@metamask/utils';

import { TypedEventEmitter } from '../../types';

/**
 * The events that a `SnapDevice` can emit.
 */
export type SnapDeviceEvents = {
  /**
   * Emitted when data is read from the device.
   *
   * @param data - The data read from the device.
   */
  data: (data: Hex) => void;
};

/**
 * An abstract class that represents a device that is available to the Snap.
 */
export abstract class SnapDevice extends TypedEventEmitter<SnapDeviceEvents> {
  /**
   * The device type.
   */
  abstract readonly type: DeviceType;

  /**
   * The device ID.
   */
  abstract readonly id: DeviceId;

  /**
   * Read data from the device.
   *
   * @param params - The arguments to pass to the device.
   * @returns The data read from the device.
   */
  abstract read(params: ReadDeviceParams): Promise<ReadDeviceResult>;

  /**
   * Write data to the device.
   *
   * @param params - The arguments to pass to the device.
   */
  abstract write(params: WriteDeviceParams): Promise<void>;

  /**
   * Close the connection to the device.
   */
  abstract close(): Promise<void>;
}
