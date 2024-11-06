import { deviceId } from '@metamask/snaps-sdk';
import type { Infer } from '@metamask/superstruct';
import { array, is, object } from '@metamask/superstruct';

export const DeviceSpecificationStruct = object({
  /**
   * The device ID that the Snap has permission to access.
   */
  deviceId: deviceId(),
});

/**
 * A device specification, which is used as caveat value.
 */
export type DeviceSpecification = Infer<typeof DeviceSpecificationStruct>;

/**
 * Check if the given value is a {@link DeviceSpecification} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a {@link DeviceSpecification} object.
 */
export function isDeviceSpecification(
  value: unknown,
): value is DeviceSpecification {
  return is(value, DeviceSpecificationStruct);
}

export const DeviceSpecificationArrayStruct = array(DeviceSpecificationStruct);

/**
 * A device specification array, which is used as caveat value.
 */
export type DeviceSpecificationArray = Infer<
  typeof DeviceSpecificationArrayStruct
>;

/**
 * Check if the given value is a {@link DeviceSpecificationArray} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a {@link DeviceSpecificationArray} object.
 */
export function isDeviceSpecificationArray(
  value: unknown,
): value is DeviceSpecificationArray {
  return is(value, DeviceSpecificationArrayStruct);
}
