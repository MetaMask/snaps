import type {
  DeviceId,
  DeviceType,
  ReadDeviceParams,
  ReadDeviceResult,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import { logError } from '@metamask/snaps-utils';
import type { Hex } from '@metamask/utils';
import { Mutex } from 'async-mutex';

import { TypedEventEmitter } from '../../types';
import { CLOSE_DEVICE_TIMEOUT } from '../constants';

/**
 * The events that a `Device` can emit.
 */
export type DeviceEvents = {
  /**
   * Emitted when data is read from the device.
   *
   * @param data - The data read from the device.
   */
  data: (data: Hex) => void;
};

/**
 * An abstract class that represents a device that is available to the Snap.
 */
export abstract class Device extends TypedEventEmitter<DeviceEvents> {
  /**
   * The device type.
   */
  abstract readonly type: DeviceType;

  /**
   * The device ID.
   */
  abstract readonly id: DeviceId;

  /**
   * A timeout to close the device after a certain amount of time.
   */
  #timeout: NodeJS.Timeout | null = null;

  protected constructor() {
    super();

    this.open = this.#withTimeout(this.open.bind(this), CLOSE_DEVICE_TIMEOUT);
    this.read = this.#withMutex(this.read.bind(this));
    this.write = this.#withMutex(this.write.bind(this));
  }

  /**
   * Read data from the device.
   *
   * @param params - The arguments to pass to the device.
   * @returns The data read from the device.
   */
  abstract read(params: ReadDeviceParams): Promise<ReadDeviceResult>;

  /**
   * Write data to the device.
   *
   * @param params - The arguments to pass to the device.
   */
  abstract write(params: WriteDeviceParams): Promise<void>;

  /**
   * Open the connection to the device. This must be called before any read or
   * write operations.
   */
  abstract open(): Promise<void>;

  /**
   * Close the connection to the device. This should be called when the device
   * is no longer needed, and may be called after a timeout.
   */
  abstract close(): Promise<void>;

  /**
   * Run a function with an async mutex, ensuring that only one instance of the
   * function can run at a time.
   *
   * @param fn - The function to run with a mutex.
   * @returns The wrapped function.
   * @template OriginalFunction - The original function type. This is inferred
   * from the `fn` argument, and used to determine the return type of the
   * wrapped function.
   */
  #withMutex<OriginalFunction extends (...args: any[]) => Promise<Type>, Type>(
    fn: OriginalFunction,
  ): (...args: Parameters<OriginalFunction>) => Promise<Type> {
    const mutex = new Mutex();

    return async (...args: Parameters<OriginalFunction>) => {
      return await mutex.runExclusive(async () => await fn(...args));
    };
  }

  /**
   * Run a function with a timeout, ensuring that the device is closed after a
   * certain amount of time.
   *
   * @param fn - The function to run with a timeout.
   * @param timeout - The timeout in milliseconds.
   * @returns The wrapped function.
   */
  #withTimeout<
    OriginalFunction extends (...args: any[]) => Promise<Type>,
    Type,
  >(
    fn: OriginalFunction,
    timeout: number,
  ): (...args: Parameters<OriginalFunction>) => Promise<Type> {
    return async (...args: Parameters<OriginalFunction>) => {
      if (this.#timeout) {
        clearTimeout(this.#timeout);
      }

      this.#timeout = setTimeout(() => {
        this.close().catch((error) => {
          logError('Failed to close device.', error);
        });
      }, timeout);

      return await fn(...args);
    };
  }
}
