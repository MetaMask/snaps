import type { Hex } from '@metamask/utils';

import type { ScopedDeviceId } from '../device';

/**
 * The request parameters for the `snap_writeDevice` method when writing to a
 * HID device.
 */
type HidWriteParams = {
  /**
   * The type of the device.
   */
  type: 'hid';

  /**
   * The ID of the device to write to.
   */
  id: ScopedDeviceId<'hid'>;

  /**
   * The type of the data to read. This is either an output report or a feature
   * report. It defaults to `output` if not provided.
   */
  reportType?: 'output' | 'feature';

  /**
   * The data to write to the device.
   */
  data: Hex;

  /**
   * The report ID to write to. This is only required for devices that use
   * report IDs, and defaults to `0` if not provided.
   */
  reportId?: number;
};

/**
 * The request parameters for the `snap_writeDevice` method.
 */
export type WriteDeviceParams = HidWriteParams;

/**
 * The result returned by the `snap_writeDevice` method.
 */
export type WriteDeviceResult = never;
