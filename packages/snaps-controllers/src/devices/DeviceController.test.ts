import { DeviceType } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  getMockDevice,
  getMockDeviceManager,
  getRestrictedDeviceControllerMessenger,
} from '../test-utils';
import { DeviceController } from './DeviceController';
import { HIDManager } from './implementations';

jest.mock('./implementations/hid-manager');

describe('DeviceController', () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'hid', {
      value: {},
    });
  });

  it('pairs an HID device', async () => {
    const manager = getMockDeviceManager();
    const device = getMockDevice();
    jest.mocked(HIDManager).mockImplementation(() => manager as HIDManager);

    const messenger = getRestrictedDeviceControllerMessenger();

    // eslint-disable-next-line no-new
    new DeviceController({ messenger });

    const promise = messenger.call(
      'DeviceController:requestDevice',
      MOCK_SNAP_ID,
      { type: DeviceType.HID },
    );

    manager.connect(device);
    messenger.call('DeviceController:resolvePairing', device.id);

    const { id: deviceId } = await promise;
    expect(deviceId).toBe(device.id);

    // const array = new Uint8Array([1, 2, 3, 4]);
    //
    // await messenger.call('DeviceController:writeDevice', MOCK_SNAP_ID, {
    //   type: 'hid',
    //   id: deviceId,
    //   data: bytesToHex(array),
    // });
    //
    // expect(device.sendReport).toHaveBeenCalledWith(0, array);
    //
    // const data = await messenger.call(
    //   'DeviceController:readDevice',
    //   MOCK_SNAP_ID,
    //   { type: 'hid', id: deviceId },
    // );
    //
    // expect(data).toStrictEqual(
    //   bytesToHex(new Uint8Array([10, 11, 12, 13, 14, 15])),
    // );
  });

  it('reads data from the device', async () => {
    const manager = getMockDeviceManager();
    const device = getMockDevice();
    jest.mocked(HIDManager).mockImplementation(() => manager as HIDManager);

    const messenger = getRestrictedDeviceControllerMessenger();

    // eslint-disable-next-line no-new
    new DeviceController({ messenger });

    const promise = messenger.call(
      'DeviceController:requestDevice',
      MOCK_SNAP_ID,
      { type: DeviceType.HID },
    );

    manager.connect(device);
    messenger.call('DeviceController:resolvePairing', device.id);

    await promise;

    device.queue('0x0a0b0c0d0e0f');
    const data = await messenger.call(
      'DeviceController:readDevice',
      MOCK_SNAP_ID,
      { type: DeviceType.HID, id: device.id },
    );

    expect(data).toBe('0x0a0b0c0d0e0f');
  });

  it('writes data to the device', async () => {
    const manager = getMockDeviceManager();
    const device = getMockDevice();
    jest.mocked(HIDManager).mockImplementation(() => manager as HIDManager);

    const messenger = getRestrictedDeviceControllerMessenger();

    // eslint-disable-next-line no-new
    new DeviceController({ messenger });

    const promise = messenger.call(
      'DeviceController:requestDevice',
      MOCK_SNAP_ID,
      { type: DeviceType.HID },
    );

    manager.connect(device);
    messenger.call('DeviceController:resolvePairing', device.id);

    await promise;
    await messenger.call('DeviceController:writeDevice', MOCK_SNAP_ID, {
      type: DeviceType.HID,
      id: device.id,
      data: '0x0a0b0c0d0e0f',
    });

    expect(device.buffer).toStrictEqual([
      {
        reportType: 'output',
        reportId: 0,
        data: '0x0a0b0c0d0e0f',
      },
    ]);
  });
});
