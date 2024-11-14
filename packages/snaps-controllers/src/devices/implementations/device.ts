import type {
  DeviceId,
  DeviceType,
  ReadDeviceParams,
  ReadDeviceResult,
  WriteDeviceParams,
} from '@metamask/snaps-sdk';
import type { Hex } from '@metamask/utils';
import { Mutex } from 'async-mutex';

import { TypedEventEmitter } from '../../types';

/**
 * The events that a `SnapDevice` can emit.
 */
export type SnapDeviceEvents = {
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
export abstract class SnapDevice extends TypedEventEmitter<SnapDeviceEvents> {
  /**
   * The device type.
   */
  abstract readonly type: DeviceType;

  /**
   * The device ID.
   */
  abstract readonly id: DeviceId;

  constructor() {
    super();

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
   * Open the connection to the device.
   */
  abstract open(): Promise<void>;

  /**
   * Close the connection to the device.
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
}
