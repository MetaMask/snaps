import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import { bytesToHex } from '@metamask/utils';

import {
  getRestrictedDeviceControllerMessenger,
  MOCK_DEVICE_ID,
} from '../test-utils';
import { DeviceController } from './DeviceController';

/**
 * Mock the navigator object to return a mock HID device.
 *
 * @returns The mock navigator object and the mock HID device.
 */
function mockNavigator() {
  const mockDevice = {
    vendorId: 11415,
    productId: 4117,
    productName: 'Nano S',
    open: jest.fn(),
    sendReport: jest.fn(),
    addEventListener: jest.fn().mockImplementation((_type, callback) => {
      const array = new Uint8Array([10, 11, 12, 13, 14, 15]);
      const data = new DataView(array.buffer);
      callback({ reportId: 0, data });
    }),
  };

  const navigatorMock = {
    hid: {
      requestDevice: jest.fn().mockResolvedValue([mockDevice]),
      getDevices: jest.fn().mockResolvedValue([mockDevice]),
    },
  };

  Object.defineProperty(globalThis, 'navigator', { value: navigatorMock });

  return { hid: navigatorMock, device: mockDevice };
}

describe('DeviceController', () => {
  it('can request a device and use read/write', async () => {
    const { device } = mockNavigator();
    const messenger = getRestrictedDeviceControllerMessenger();

    // eslint-disable-next-line no-new
    new DeviceController({ messenger });

    const pairingPromise = messenger.call(
      'DeviceController:requestDevice',
      MOCK_SNAP_ID,
      { type: 'hid' },
    );

    messenger.call('DeviceController:resolvePairing', MOCK_DEVICE_ID);

    const { id: deviceId } = await pairingPromise;

    const array = new Uint8Array([1, 2, 3, 4]);

    await messenger.call('DeviceController:writeDevice', MOCK_SNAP_ID, {
      type: 'hid',
      id: deviceId,
      data: bytesToHex(array),
    });

    expect(device.sendReport).toHaveBeenCalledWith(0, array);

    const data = await messenger.call(
      'DeviceController:readDevice',
      MOCK_SNAP_ID,
      { type: 'hid', id: deviceId },
    );

    expect(data).toStrictEqual(
      bytesToHex(new Uint8Array([10, 11, 12, 13, 14, 15])),
    );
  });
});
