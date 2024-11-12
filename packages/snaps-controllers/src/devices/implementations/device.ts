import type {
  DeviceId,
  DeviceType,
  ReadDeviceParams,
  ReadDeviceResult,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import type { Hex } from '@metamask/utils';
import type { EventEmitter } from 'events';

export interface SnapDevice extends EventEmitter {
  /**
   * The device type.
   */
  readonly type: DeviceType;

  /**
   * The device ID.
   */
  readonly id: DeviceId;

  /**
   * Read data from the device.
   *
   * @param params - The arguments to pass to the device.
   * @returns The data read from the device.
   */
  read(params: ReadDeviceParams): Promise<ReadDeviceResult>;

  /**
   * Write data to the device.
   *
   * @param params - The arguments to pass to the device.
   */
  write(params: WriteDeviceParams): Promise<void>;

  /**
   * Close the connection to the device.
   */
  close(): Promise<void>;

  on(type: 'data', listener: (data: Hex) => void): this;
  on(type: 'disconnect', listener: () => void): this;

  once(type: 'data', listener: (data: Hex) => void): this;
  once(type: 'disconnect', listener: () => void): this;

  emit(type: 'data', data: Hex): boolean;
  emit(type: 'disconnect'): boolean;
}
