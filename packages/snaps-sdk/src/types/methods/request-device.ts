import { number, object, optional } from '@metamask/superstruct';

import type { Describe, EnumToUnion } from '../../internals';
import type { Device, DeviceType } from '../device';

export type DeviceFilter = {
  /**
   * The vendor ID of the device.
   */
  vendorId?: number;

  /**
   * The product ID of the device.
   */
  productId?: number;
};

/**
 * A struct that represents the `DeviceFilter` type.
 */
export const DeviceFilterStruct: Describe<DeviceFilter> = object({
  vendorId: optional(number()),
  productId: optional(number()),
});

/**
 * The request parameters for the `snap_requestDevice` method.
 */
export type RequestDeviceParams = {
  /**
   * The type of the device to request.
   */
  type: EnumToUnion<DeviceType>;

  /**
   * The filters to apply to the devices.
   */
  filters?: DeviceFilter[];
};

/**
 * The result returned by the `snap_requestDevice` method. This can be a single
 * device, or `null` if no device was provided.
 */
export type RequestDeviceResult = Device | null;
