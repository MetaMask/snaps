// @ts-expect-error Walker has no types yet.
import LavaTube from '@lavamoat/lavatube';
import ObjectMultiplex from '@metamask/object-multiplex';
import { StreamProvider } from '@metamask/providers';
import { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import { assert, Json, JsonRpcRequest, JsonRpcResponse } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { createIdRemapMiddleware } from 'json-rpc-engine';
import { Duplex, DuplexOptions, Readable } from 'stream';

import { BaseSnapExecutor } from '../BaseSnapExecutor';
import { withTeardown } from '../utils';

export type TwoWayPassThroughBuffer = {
  buffer: { chunk: any; encoding: BufferEncoding }[];
  canPush: boolean;
};

export class TwoWayPassThrough {
  static #flush(bufferData: TwoWayPassThroughBuffer, stream: Readable) {
    while (bufferData.canPush && bufferData.buffer.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { chunk: data, encoding: enc } = bufferData.buffer.shift()!;
      bufferData.canPush = stream.push(data, enc);
    }
  }

  readonly left: Duplex;

  readonly right: Duplex;

  #leftToRight: TwoWayPassThroughBuffer = {
    buffer: [],
    canPush: false,
  };

  #rightToLeft: TwoWayPassThroughBuffer = {
    buffer: [],
    canPush: false,
  };

  constructor(opts?: DuplexOptions) {
    this.left = new Duplex({
      ...opts,
      write: (chunk, encoding, callback) => {
        this.#leftToRight.buffer.push({ chunk, encoding });
        TwoWayPassThrough.#flush(this.#leftToRight, this.right);
        return callback();
      },
      read: () => {
        this.#rightToLeft.canPush = true;
        TwoWayPassThrough.#flush(this.#rightToLeft, this.left);
      },
    });

    this.right = new Duplex({
      ...opts,
      write: (chunk, encoding, callback) => {
        this.#rightToLeft.buffer.push({ chunk, encoding });
        TwoWayPassThrough.#flush(this.#rightToLeft, this.left);
        return callback();
      },
      read: () => {
        this.#leftToRight.canPush = true;
        TwoWayPassThrough.#flush(this.#leftToRight, this.right);
      },
    });
  }
}

export class TestSnapExecutor extends BaseSnapExecutor {
  readonly #commandLeft: Duplex;

  readonly #rpcLeft: Duplex;

  readonly #commandBuffer: any[] = [];

  readonly #rpcBuffer: any[] = [];

  readonly #commandListeners: ((chunk: any) => void)[] = [];

  readonly #rpcListeners: ((chunk: any) => void)[] = [];

  constructor() {
    const rpc = new TwoWayPassThrough({
      objectMode: true,
      allowHalfOpen: false,
    });
    const command = new TwoWayPassThrough({
      objectMode: true,
      allowHalfOpen: false,
    });

    super(command.right, rpc.right);

    this.#commandLeft = command.left;
    this.#rpcLeft = rpc.left;

    this.#commandLeft.on('data', (chunk) => {
      this.#commandBuffer.push(chunk);
      TestSnapExecutor.#flushReads(this.#commandBuffer, this.#commandListeners);
    });

    this.#rpcLeft.on('data', (chunk) => {
      this.#rpcBuffer.push(chunk);
      TestSnapExecutor.#flushReads(this.#rpcBuffer, this.#rpcListeners);
    });
  }

  // Utility function for executing snaps
  public async executeSnap(
    id: number,
    name: string,
    code: string,
    endowments: string[],
  ) {
    const providerRequestPromise = this.readRpc();
    await this.writeCommand({
      jsonrpc: '2.0',
      id,
      method: 'executeSnap',
      params: [name, code, endowments],
    });

    // In case we are running fake timers, execute a tiny step that forces
    // `setTimeout` to execute, is required for stream communication.
    if ('clock' in setTimeout) {
      jest.advanceTimersByTime(1);
    }

    const providerRequest = await providerRequestPromise;
    await this.writeRpc({
      name: 'metamask-provider',
      data: {
        jsonrpc: '2.0',
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        id: providerRequest.data.id!,
        result: {
          isUnlocked: false,
          accounts: [],
          chainId: '0x1',
          networkVersion: '1',
        },
      },
    });

    if ('clock' in setTimeout) {
      jest.advanceTimersByTime(1);
    }
  }

  public async writeCommand(message: JsonRpcRequest): Promise<void> {
    return new Promise((resolve, reject) =>
      this.#commandLeft.write(message, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      }),
    );
  }

  public async readCommand(): Promise<JsonRpcRequest> {
    const promise = new Promise<JsonRpcRequest>((resolve) =>
      this.#commandListeners.push(resolve),
    );

    TestSnapExecutor.#flushReads(this.#commandBuffer, this.#commandListeners);

    return promise;
  }

  static #flushReads(readBuffer: any[], listeners: ((chunk: any) => void)[]) {
    while (readBuffer.length && listeners.length) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const chunk = readBuffer.shift()!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      listeners.shift()!(chunk);
    }
  }

  public async writeRpc(message: {
    name: string;
    data: JsonRpcResponse<Json>;
  }): Promise<void> {
    return new Promise((resolve, reject) =>
      this.#rpcLeft.write(message, (error) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      }),
    );
  }

  public async readRpc(): Promise<{
    name: string;
    data: JsonRpcRequest;
  }> {
    const promise = new Promise<{
      name: string;
      data: JsonRpcRequest;
    }>((resolve) => this.#rpcListeners.push(resolve));

    TestSnapExecutor.#flushReads(this.#rpcBuffer, this.#rpcListeners);

    return promise;
  }
}

// These are fake types just to make this test work with the TypeScript
/* eslint-disable @typescript-eslint/naming-convention */
export type HardenedEndowmentSubject = {
  __flag: unknown;
  prototype: { __flag: unknown };
};
export type HardenedEndowmentInstance = {
  __flag: unknown;
  __proto__: { __flag: unknown };
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * This function represents utility which is executed inside a compartment.
 * It will try to change a subject or its prototype.
 * Potential errors are caught and reported in an array returned.
 *
 * @param subject - Test subject (instance, object, function).
 * @param factory - Factory that creates an instance using constructor function.
 * @returns Array of error messages.
 */
export function testEndowmentHardening(
  subject: HardenedEndowmentSubject,
  factory: () => HardenedEndowmentInstance,
): unknown[] {
  const log = [];
  const instance = factory();
  try {
    subject.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    if (instance) {
      instance.__flag = 'not_secure';
    }
  } catch (error) {
    log.push(error.message);
  }
  try {
    subject.prototype.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // eslint-disable-next-line no-proto
    instance.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // @ts-expect-error Test unusual approach for a security reasons.
    // eslint-disable-next-line no-proto
    subject.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  return log;
}

/**
 * Object walker test utility function.
 * This function will instantiate and configure @lavamoat/lavatube for testing
 * endowment specific use case. It will also adapt its result to a boolean value.
 *
 * @param subject - Subject to be tested.
 * @param target - Target object.
 * @returns True if target object is found, false otherwise.
 */
export function walkAndSearch(subject: unknown, target: unknown) {
  let result = false;
  const walker = new LavaTube(
    (value: unknown) => {
      result = target === value;
      return result;
    },
    { maxRecursionLimit: 100, onShouldIgnoreError: () => true },
  );
  walker.walk(subject);
  return result;
}

/**
 * Create and return mocked stream provider instance used for testing.
 * Note: Stream is wrapped in a Proxy to simulate limited provider used in
 * BaseSnapExecutor for ethereum endowment.
 *
 * @returns Proxy to StreamProvider instance.
 */
export function getMockedStreamProvider() {
  const mux = new ObjectMultiplex();
  const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

  const provider = new StreamProvider(rpcStream, {
    jsonRpcStreamName: 'metamask-provider',
    rpcMiddleware: [createIdRemapMiddleware()],
  });

  const originalRequest = provider.request.bind(provider);

  const request = async (args: RequestArguments) => {
    assert(
      !args.method.startsWith('snap_'),
      ethErrors.rpc.methodNotFound({
        data: {
          method: args.method,
        },
      }),
    );
    return await withTeardown(originalRequest(args), { lastTeardown: 0 });
  };

  // To harden and limit access to internals, we use a proxy.
  // Proxy target is intentionally set to be an empty object, to ensure
  // that access to the prototype chain is not possible.
  return new Proxy(
    {},
    {
      has(_target: object, prop: string | symbol) {
        if (prop === 'request') {
          return true;
        } else if (['on', 'removeListener'].includes(prop as string)) {
          return true;
        }

        return false;
      },
      get(_target, prop: keyof StreamProvider) {
        if (prop === 'request') {
          return request;
        } else if (['on', 'removeListener'].includes(prop)) {
          return provider[prop];
        }

        return undefined;
      },
    },
  );
}
