/**
 * The type of the device.
 */
export type DeviceType = 'hid' | 'bluetooth';

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
  vendorId: string;

  /**
   * The product ID of the device.
   */
  productId: string;

  /**
   * Whether the device is available.
   */
  available: boolean;
};
