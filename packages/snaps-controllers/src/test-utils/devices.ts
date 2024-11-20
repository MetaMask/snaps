import type { PermissionConstraint } from '@metamask/permission-controller';
import { SnapEndowments } from '@metamask/snaps-rpc-methods';
import type {
  DeviceId,
  DeviceMetadata,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { Hex } from '@metamask/utils';
import { assert } from '@metamask/utils';

import { Device, DeviceManager } from '../devices/implementations';

export const MOCK_DEVICE_ID = 'hid:11415:4117';

export const MOCK_DEVICE_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.DeviceIds,
      value: { devices: [{ deviceId: MOCK_DEVICE_ID }] },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Devices,
};

/**
 * Get a mock device metadata object.
 *
 * @param device - The partial device metadata object.
 * @param device.id - The device ID.
 * @param device.type - The device type.
 * @param device.name - The device name.
 * @param device.productId - The device product ID.
 * @param device.vendorId - The device vendor ID.
 * @param device.available - Whether the device is available.
 * @returns The mock device metadata object.
 */
export function getMockDeviceMetadata({
  id = MOCK_DEVICE_ID,
  type = DeviceType.HID,
  name = 'Mock Device',
  productId = 0x1234,
  vendorId = 0x5678,
  available = true,
}: Partial<DeviceMetadata> = {}): DeviceMetadata {
  return {
    id,
    type,
    name,
    productId,
    vendorId,
    available,
  };
}

export type MockData = {
  reportType: 'output' | 'feature';
  reportId: number;
  data: Hex;
};

/**
 * A mock device class. See {@link getMockDevice} to get a mock device.
 */
class MockDevice extends Device {
  readonly type: DeviceType;

  readonly id: DeviceId;

  /**
   * The buffer of messages that are queued to be read from the device.
   *
   * This property is specific to the mock device implementation.
   */
  readonly messages: Hex[] = [];

  /**
   * The buffer of messages that have been written to the device.
   *
   * This property is specific to the mock device implementation.
   */
  readonly buffer: MockData[] = [];

  /**
   * Whether the device is open.
   */
  #open = false;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(metadata: DeviceMetadata) {
    super();

    this.type = metadata.type;
    this.id = metadata.id;
  }

  async open() {
    this.#open = true;
  }

  async close() {
    this.#open = false;
  }

  async read(): Promise<Hex> {
    assert(this.#open, 'Device is not open.');

    const message = this.messages.shift();
    assert(message, 'No message to read.');

    return message;
  }

  async write({
    type,
    id,
    reportType = 'output',
    reportId = 0,
    data,
  }: WriteDeviceParams) {
    assert(type === this.type, 'Invalid device type.');
    assert(id === this.id, 'Invalid device ID.');
    assert(this.#open, 'Device is not open.');

    this.buffer.push({
      reportType,
      reportId,
      data,
    });
  }

  /**
   * Queue a message to be read from the device. The message is added to the end
   * of the queue.
   *
   * This method is specific to the mock device implementation.
   *
   * @param message - The message to queue.
   */
  queue(message: Hex) {
    this.messages.push(message);
  }
}

/**
 * Get a mock device.
 *
 * @param metadata - The device metadata. Defaults to a mock device metadata
 * object.
 * @returns The mock device.
 */
export function getMockDevice(
  metadata: DeviceMetadata = getMockDeviceMetadata(),
): MockDevice {
  return new MockDevice(metadata);
}

class MockDeviceManager extends DeviceManager {
  #devices: Record<DeviceId, MockDevice> = {};

  getDevice: jest.MockedFunction<DeviceManager['getDevice']> = jest
    .fn()
    .mockImplementation((id: DeviceId) => {
      return getMockDevice(getMockDeviceMetadata({ id }));
    });

  getDeviceMetadata: jest.MockedFunction<DeviceManager['getDeviceMetadata']> =
    jest.fn().mockImplementation(() => {
      return Object.values(this.#devices).map((device) => ({
        id: device.id,
        type: device.type,
        name: device.id,
        productId: 0x1234,
        vendorId: 0x5678,
        available: true,
      }));
    });

  connect(device: MockDevice) {
    this.#devices[device.id] = device;
    this.emit('connect', device);
  }

  disconnect(deviceId: DeviceId) {
    delete this.#devices[deviceId];
    this.emit('disconnect', deviceId);
  }
}

/**
 * Get a mock device manager.
 *
 * @returns The mock device manager.
 */
export function getMockDeviceManager(): MockDeviceManager {
  return new MockDeviceManager();
}
