import type { DeviceModel } from '@ledgerhq/devices';
import { identifyUSBProductId, ledgerUSBVendorId } from '@ledgerhq/devices';
import hidFraming from '@ledgerhq/devices/hid-framing';
import { TransportOpenUserCancelled } from '@ledgerhq/errors';
import type {
  DescriptorEvent,
  Observer,
  Subscription,
} from '@ledgerhq/hw-transport';
import Transport from '@ledgerhq/hw-transport';
import type { HidDeviceMetadata } from '@metamask/snaps-sdk';
import { bytesToHex } from '@metamask/utils';

/**
 * Request a Ledger device using Snaps.
 *
 * @returns A promise that resolves to a device, or `null` if no device was
 * provided.
 */
async function requestDevice() {
  return (await snap.request({
    method: 'snap_requestDevice',
    params: { type: 'hid', filters: [{ vendorId: ledgerUSBVendorId }] },
  })) as HidDeviceMetadata;
}

export default class TransportSnapsHID extends Transport {
  readonly device: HidDeviceMetadata;

  readonly deviceModel: DeviceModel | null | undefined;

  #channel = Math.floor(Math.random() * 0xffff);

  #packetSize = 64;

  constructor(device: HidDeviceMetadata) {
    super();

    this.device = device;
    this.deviceModel = identifyUSBProductId(device.productId);
  }

  /**
   * Check if the transport is supported by the current environment.
   *
   * @returns A promise that resolves to `true` if the transport is supported,
   * or `false` otherwise.
   */
  static async isSupported() {
    const types = await snap.request({
      method: 'snap_getSupportedDevices',
    });

    return types.includes('hid');
  }

  /**
   * List the HID devices that were previously authorised by the user.
   *
   * @returns A promise that resolves to an array of devices.
   */
  static async list() {
    const devices = (await snap.request({
      method: 'snap_listDevices',
      params: { type: 'hid' },
    })) as HidDeviceMetadata[];

    return devices.filter(
      (device) => device.vendorId === ledgerUSBVendorId && device.available,
    );
  }

  /**
   * Get the first Ledger device that was previously authorised by the user, or
   * request a new device if none are available.
   *
   * @param observer - The observer to notify when a device is found.
   * @returns A subscription that can be used to unsubscribe from the observer.
   */
  static listen(
    observer: Observer<DescriptorEvent<HidDeviceMetadata>>,
  ): Subscription {
    let unsubscribed = false;

    /**
     * Unsubscribe from the subscription.
     */
    function unsubscribe() {
      unsubscribed = true;
    }

    /**
     * Emit a device to the observer.
     *
     * @param device - The device to emit.
     */
    function emit(device: HidDeviceMetadata) {
      observer.next({
        type: 'add',
        descriptor: device,
        deviceModel: identifyUSBProductId(device.productId),
      });

      observer.complete();
    }

    this.list()
      .then((devices) => {
        if (unsubscribed) {
          return;
        }

        if (devices.length > 0) {
          emit(devices[0]);
          return;
        }

        requestDevice()
          .then((device) => {
            if (unsubscribed) {
              return;
            }

            if (!device) {
              observer.error(
                new TransportOpenUserCancelled(
                  'No device was provided to connect to.',
                ),
              );

              return;
            }

            emit(device);
          })
          .catch((error) => {
            observer.error(new TransportOpenUserCancelled(error.message));
          });
      })
      .catch((error) => {
        observer.error(new TransportOpenUserCancelled(error.message));
      });

    return { unsubscribe };
  }

  /**
   * Request to connect to a Ledger device. This will always prompt the user to
   * connect a device.
   *
   * @returns A promise that resolves to a transport.
   */
  static async request() {
    const device = await requestDevice();
    if (!device) {
      throw new TransportOpenUserCancelled(
        'No device was provided to connect to.',
      );
    }

    return this.open(device);
  }

  /**
   * Create a transport with a previously connected device. Returns `null` if no
   * device was found.
   *
   * @returns A promise that resolves to a transport, or `null` if no device was
   * found.
   */
  static async openConnected() {
    const devices = await this.list();
    if (devices.length > 0) {
      return this.open(devices[0]);
    }

    return null;
  }

  /**
   * Create a transport with a specific device.
   *
   * @param device - The device to connect to.
   * @returns A transport.
   */
  static async open(device: HidDeviceMetadata) {
    return new TransportSnapsHID(device);
  }

  /**
   * Close the connection to the transport device.
   */
  async close() {
    // Snaps devices cannot be closed.
  }

  /**
   * Exchange with the device using APDU protocol.
   *
   * @param apdu - The APDU command to send to the device.
   * @returns The response from the device.
   */
  exchange = async (apdu: Buffer): Promise<Buffer> => {
    return await this.exchangeAtomicImpl(async () => {
      const framing = hidFraming(this.#channel, this.#packetSize);
      const blocks = framing.makeBlocks(apdu);

      for (const block of blocks) {
        await snap.request({
          method: 'snap_writeDevice',
          params: {
            type: 'hid',
            id: this.device.id,
            data: bytesToHex(block),
          },
        });
      }

      let result;
      let accumulator = null;

      while (!(result = framing.getReducedResult(accumulator))) {
        const bytes = await snap.request({
          method: 'snap_readDevice',
          params: {
            type: 'hid',
            id: this.device.id,
          },
        });

        const buffer = Buffer.from(bytes.slice(2), 'hex');
        accumulator = framing.reduceResponse(accumulator, buffer);
      }

      return result;
    });
  };

  setScrambleKey() {
    // This transport does not support setting a scramble key.
  }
}
