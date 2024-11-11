import type { Hex } from '@metamask/utils';

import type { EnumToUnion } from '../../internals';
import type { DeviceType, ScopedDeviceId } from '../device';

/**
 * The request parameters for the `snap_readDevice` method reading from an HID
 * device.
 */
type HidReadParams = {
  /**
   * The type of the device.
   */
  type: EnumToUnion<DeviceType.HID>;

  /**
   * The ID of the device to read from.
   */
  id: ScopedDeviceId<DeviceType.HID>;

  /**
   * The type of the data to read. This is either an output report or a feature
   * report. It defaults to `output` if not provided.
   */
  reportType?: 'output' | 'feature';

  /**
   * The report ID to read from. This is only required for devices that use
   * report IDs, and defaults to `0` if not provided.
   */
  reportId?: number;
};

/**
 * The request parameters for the `snap_readDevice` method.
 */
export type ReadDeviceParams = HidReadParams;

/**
 * The result returned by the `snap_readDevice` method.
 */
export type ReadDeviceResult = Hex;
