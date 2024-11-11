import type { Struct } from '@metamask/superstruct';
import { refine, string } from '@metamask/superstruct';

import { enumValue } from '../internals';

/**
 * The type of the device. Currently, only `hid` is supported.
 */
export enum DeviceType {
  HID = 'hid',
}

/**
 * A struct that represents the `DeviceType` type.
 */
export const DeviceTypeStruct = enumValue(DeviceType.HID);

/**
 * The ID of the device. It consists of the type of the device, the vendor ID,
 * and the product ID.
 */
export type DeviceId = `${DeviceType}:${string}:${string}`;

/**
 * The ID of the device that is scoped to the type of the device.
 *
 * @example
 * type HidDeviceId = ScopedDeviceId<'hid'>;
 * // => `hid:${string}:${string}`
 */
export type ScopedDeviceId<Type extends DeviceType> =
  `${Type}:${string}:${string}` extends DeviceId
    ? `${Type}:${string}:${string}`
    : never;

/**
 * A struct that represents the `DeviceId` type.
 *
 * @param type - The type of the device.
 * @returns A struct that represents the `DeviceId` type.
 */
export function deviceId<Type extends DeviceType>(
  type?: Type,
): Type extends DeviceType ? Struct<ScopedDeviceId<Type>> : Struct<DeviceId> {
  return refine(string(), 'device ID', (value) => {
    if (type) {
      return value.startsWith(`${type}:`) && value.split(':').length === 3;
    }

    return value.split(':').length === 3;
  }) as Type extends DeviceType
    ? Struct<ScopedDeviceId<Type>>
    : Struct<DeviceId>;
}

/**
 * A device that is available to the Snap.
 */
export type Device = {
  /**
   * The ID of the device.
   */
  id: DeviceId;

  /**
   * The type of the device.
   */
  type: DeviceType;

  /**
   * The name of the device.
   */
  name: string;

  /**
   * The vendor ID of the device.
   */
  vendorId: number;

  /**
   * The product ID of the device.
   */
  productId: number;

  /**
   * Whether the device is available.
   */
  available: boolean;
};

type ScopedDevice<Type extends DeviceType> = Device & {
  type: Type;
  id: ScopedDeviceId<Type>;
};

export type HidDevice = ScopedDevice<DeviceType.HID>;
