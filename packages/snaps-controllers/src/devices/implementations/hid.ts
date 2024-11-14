import { DeviceType } from '@metamask/snaps-sdk';
import type {
  ReadDeviceParams,
  ScopedDeviceId,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import type { Hex } from '@metamask/utils';
import { hexToBytes, add0x, assert } from '@metamask/utils';

import { SnapDevice } from './device';

/**
 * A device that is connected to the Snap via HID.
 */
export class HIDSnapDevice extends SnapDevice {
  /**
   * The device type. Always `hid`.
   */
  readonly type = DeviceType.HID;

  /**
   * The device ID.
   */
  readonly id: ScopedDeviceId<DeviceType.HID>;

  /**
   * The underlying `HIDDevice` instance.
   */
  readonly #device: HIDDevice;

  /**
   * A buffer to store incoming data.
   */
  #buffer: { reportId: number; data: Hex }[] = [];

  constructor(id: ScopedDeviceId<DeviceType.HID>, device: HIDDevice) {
    super();

    this.id = id;
    this.#device = device;

    device.addEventListener('inputreport', (event: HIDInputReportEvent) => {
      const data = add0x(Buffer.from(event.data.buffer).toString('hex'));

      const result = {
        reportId: event.reportId,
        data,
      };

      this.#buffer.push(result);

      // TODO: Emit `reportId` as well?
      this.emit('data', result.data);
    });
  }

  /**
   * Read data from the device.
   *
   * @param params - The arguments.
   * @param params.type - The type of the device.
   * @param params.reportType - The type of report to read. Defaults to
   * `output`.
   * @param params.reportId - The ID of the report to read. Defaults to `0`.
   * @returns The data read from the device.
   */
  async read({ type, reportType = 'output', reportId = 0 }: ReadDeviceParams) {
    assert(type === this.type);
    assert(this.#device.opened, 'Device is not open.');

    if (reportType === 'feature') {
      const view = await this.#device.receiveFeatureReport(reportId);
      return add0x(Buffer.from(view.buffer).toString('hex'));
    }

    return new Promise<Hex>((resolve) => {
      const buffer = this.#buffer.shift();
      if (buffer) {
        return resolve(buffer.data);
      }

      return this.once('data', (data) => {
        resolve(data);
      });
    });
  }

  /**
   * Write data to the device.
   *
   * @param params - The arguments.
   * @param params.type - The type of the device.
   * @param params.reportType - The type of report to write. Defaults to
   * `output`.
   * @param params.reportId - The ID of the report to write. Defaults to `0`.
   * @param params.data - The data to write to the device.
   * @returns The result of the write operation.
   */
  async write({
    type,
    reportType = 'output',
    reportId = 0,
    data,
  }: WriteDeviceParams) {
    assert(type === this.type);
    assert(this.#device.opened, 'Device is not open.');

    const buffer = hexToBytes(data);
    if (reportType === 'feature') {
      return await this.#device.sendFeatureReport(reportId, buffer);
    }

    return await this.#device.sendReport(reportId, buffer);
  }

  /**
   * Open the connection to the device.
   */
  async open() {
    if (!this.#device.opened) {
      this.#buffer = [];
      await this.#device.open();
    }
  }

  /**
   * Close the connection to the device.
   */
  async close() {
    if (this.#device.opened) {
      this.#buffer = [];
      await this.#device.close();
    }
  }
}
