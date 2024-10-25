import type { Device, DeviceType } from '../device';

/**
 * The request parameters for the `snap_listDevices` method.
 */
export type ListDevicesParams = {
  /**
   * The type of the device to list. If not provided, all devices are listed.
   */
  type?: DeviceType;
};

/**
 * The result returned by the `snap_readDevice` method. This is a list of
 * devices that are available to the Snap.
 */
export type ListDevicesResult = Device[];
