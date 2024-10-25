import type { Device } from '../device';

/**
 * The request parameters for the `snap_listDevices` method.
 */
export type ListDevicesParams = never;

/**
 * The result returned by the `snap_readDevice` method. This is a list of
 * devices that are available to the Snap.
 */
export type ListDevicesResult = Device[];
