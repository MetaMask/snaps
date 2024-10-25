import type { DeviceType } from '@metamask/snaps-sdk';

/**
 * The request parameters for the `snap_getSupportedDevices` method.
 */
export type GetSupportedDevicesParams = never;

/**
 * The result returned by the `snap_getSupportedDevices` method.
 */
export type GetSupportedDevicesResult = DeviceType[];
