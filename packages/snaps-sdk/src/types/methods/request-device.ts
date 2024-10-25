import type { Device, DeviceType } from '../device';

type DeviceFilter = {
  /**
   * The type of the device.
   */
  vendorId?: string;

  /**
   * The product ID of the device.
   */
  productId?: string;
};

/**
 * The request parameters for the `snap_requestDevice` method.
 */
export type RequestDeviceParams = {
  /**
   * The type of the device to request.
   */
  type: DeviceType;

  /**
   * The filter to apply to the devices.
   */
  filter?: DeviceFilter;
};

/**
 * The result returned by the `snap_requestDevice` method. This can be a single
 * device, or `null` if no device was provided.
 */
export type RequestDeviceResult = Device | null;
