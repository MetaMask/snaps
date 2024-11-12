import { DeviceType } from '@metamask/snaps-sdk';
import type {
  ReadDeviceParams,
  ScopedDeviceId,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import type { Hex } from '@metamask/utils';
import { hexToBytes, add0x, assert } from '@metamask/utils';
import { EventEmitter } from 'events';

import type { SnapDevice } from './device';

export class HIDSnapDevice extends EventEmitter implements SnapDevice {
  readonly type = DeviceType.HID;

  readonly id: ScopedDeviceId<DeviceType.HID>;

  readonly #device: HIDDevice;

  readonly #buffer: { reportId: number; data: Hex }[] = [];

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
      this.emit('data', result);
    });

    navigator.hid.addEventListener('disconnect', (event) => {
      if (event.device === this.#device) {
        this.emit('disconnect');
      }
    });
  }

  async read({ reportType, reportId = 0 }: ReadDeviceParams) {
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

  async write({ type, reportType, reportId = 0, data }: WriteDeviceParams) {
    assert(type === this.type);

    const buffer = hexToBytes(data);
    if (reportType === 'feature') {
      return await this.#device.sendFeatureReport(reportId, buffer);
    }

    return await this.#device.sendReport(reportId, buffer);
  }

  async close() {
    await this.#device.close();
  }
}
