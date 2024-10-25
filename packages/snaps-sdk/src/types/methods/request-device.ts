import type { Device, DeviceType } from '../device';

type DeviceFilter = {
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
 * The request parameters for the `snap_requestDevice` method.
 */
export type RequestDeviceParams = {
  /**
   * The type of the device to request.
   */
  type: DeviceType;

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
