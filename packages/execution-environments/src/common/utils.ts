import { Readable } from 'stream';
import { rootRealmGlobal } from './globalObject';

// prettier-ignore
/* istanbul ignore next */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ReadableStream } = 'ReadableStream' in rootRealmGlobal ? rootRealmGlobal : require('node:stream/web');

/**
 * Takes an error that was thrown, determines if it is
 * an error object. If it is then it will return that. Otherwise,
 * an error object is created with the original error message.
 *
 * @param originalError - The error that was originally thrown.
 * @returns An error object.
 */
export function constructError(originalError: unknown) {
  let _originalError: Error | undefined;
  if (originalError instanceof Error) {
    _originalError = originalError;
  } else if (typeof originalError === 'string') {
    _originalError = new Error(originalError);
    // The stack is useless in this case.
    delete _originalError.stack;
  }
  return _originalError;
}

/**
 * Get all properties of an object, including its prototype chain.
 *
 * @param obj - The object to get all properties for.
 * @returns All properties of `obj` as a tuple set, containing the property name
 * and value.
 */
export function allProperties(obj: any): Set<[object, string | symbol]> {
  const properties = new Set<[any, any]>();
  let current = obj;
  do {
    for (const key of Reflect.ownKeys(current)) {
      properties.add([current, key]);
    }
  } while (
    (current = Reflect.getPrototypeOf(current)) &&
    current !== Object.prototype
  );
  return properties;
}

/**
 * Get all functions of an object, including its prototype chain. This does not
 * include constructor functions.
 *
 * @param obj - The object to get all functions for.
 * @returns An array with all functions of `obj` as string or symbol.
 */
export function allFunctions(obj: any): (string | symbol)[] {
  const result = [];
  for (const [object, key] of allProperties(obj)) {
    if (key === 'constructor') {
      continue;
    }
    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor !== undefined && typeof descriptor.value === 'function') {
      result.push(key);
    }
  }
  return result;
}

/**
 * Make proxy for Promise and handle the teardown process properly.
 * If the teardown is called in the meanwhile, Promise result will not be
 * exposed to the snap anymore and warning will be logged to the console.
 *
 * @param originalPromise - Original promise.
 * @param teardownRef - Reference containing teardown count.
 * @param teardownRef.lastTeardown - Number of the last teardown.
 * @returns New proxy promise.
 */
export function withTeardown<T>(
  originalPromise: Promise<T>,
  teardownRef: { lastTeardown: number },
): Promise<T> {
  const myTeardown = teardownRef.lastTeardown;
  return new Promise<T>((resolve, reject) => {
    originalPromise
      .then((value) => {
        if (teardownRef.lastTeardown === myTeardown) {
          resolve(value);
        } else {
          console.warn(
            'Late promise received after Snap finished execution. Promise will be dropped.',
          );
        }
      })
      .catch((reason) => {
        if (teardownRef.lastTeardown === myTeardown) {
          reject(reason);
        } else {
          console.warn(
            'Late promise received after Snap finished execution. Promise will be dropped.',
          );
        }
      });
  });
}

/**
 * Converts response body object to ReadableStream
 * if it's not already instance of it.
 * This will make stream handling possible
 * on both platforms (nodejs and web browser).
 *
 * @param body - Body object from Response.
 * @returns New WHATWG Readable stream if it was not originally provided, same otherwise.
 */
export function convertBody(body: any): ReadableStream {
  if (body instanceof ReadableStream) {
    return body;
  }
  const readable = Readable.from(body);
  return new ReadableStream({
    start(controller: { close: () => void }) {
      readable.on('end', () => {
        try {
          controller.close();
        } catch (e) {
          console.error('Error on close: ', e.message);
        }
      });
    },
    pull(controller: any) {
      const chunk = readable.read();
      if (chunk !== null) {
        controller.enqueue(chunk);
      }
    },
  });
}

/**
 * This class will properly do a teardown process
 * when used with response body stream (ReadableStream).
 */
export class ResponseBodyStreamWrapper implements ReadableStream {
  #originalBody: ReadableStream;

  abortController: AbortController;

  readonly locked: boolean;

  private registeredReaders = new Set<ReadableStreamDefaultReader>();

  constructor(ogBody: ReadableStream, abortController: AbortController) {
    this.#originalBody = ogBody;
    this.abortController = abortController;
    this.locked = false;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<any> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.#originalBody[Symbol.asyncIterator]();
  }

  cancel(reason?: any): Promise<void> {
    return this.#originalBody.cancel(reason);
  }

  getReader(): ReadableStreamDefaultReader<any> {
    const reader = this.#originalBody.getReader();
    this.registeredReaders.add(reader);

    return reader;
  }

  pipeThrough<T>(
    transform: ReadableWritablePair<T, any>,
    options?: StreamPipeOptions,
  ): ReadableStream<T> {
    return new ResponseBodyStreamWrapper(
      this.#originalBody.pipeThrough(transform, options),
      this.abortController,
    );
  }

  pipeTo(
    destination: WritableStream<any>,
    options?: StreamPipeOptions,
  ): Promise<void> {
    return this.#originalBody.pipeTo(destination, options);
  }

  tee(): [ReadableStream<any>, ReadableStream<any>] {
    const [rsOne, rsTwo] = this.#originalBody.tee();
    return [
      new ResponseBodyStreamWrapper(rsOne, this.abortController),
      new ResponseBodyStreamWrapper(rsTwo, this.abortController),
    ];
  }

  // values(options?: { preventCancel?: boolean }): AsyncIterableIterator<any> {
  //   return this.#originalBody.values(options);
  // }

  /**
   * Handles teardown process of the ReadableStream instance.
   * This will close all readers.
   */
  async teardownFunction() {
    for (const reader of this.registeredReaders) {
      await reader.cancel('Teardown process initiated.');
    }
  }
}

/**
 * This class wraps a Response object.
 * That way, a teardown process can stop any processes left.
 */
export class ResponseWrapper implements Response {
  private readonly teardownRef: { lastTeardown: number };

  private readonly abortController: AbortController;

  private registeredBodyObjects = new Set<ResponseBodyStreamWrapper>();

  #ogResponse: Response;

  constructor(ogResponse: Response, teardownRef: { lastTeardown: number }) {
    this.#ogResponse = ogResponse;
    this.teardownRef = teardownRef;
    this.abortController = new AbortController();
  }

  get body(): ReadableStream<Uint8Array> | null {
    const body = convertBody(this.#ogResponse.body);
    const wrappedBody = new ResponseBodyStreamWrapper(
      body,
      this.abortController,
    );
    this.registeredBodyObjects.add(wrappedBody);

    return wrappedBody;
  }

  get bodyUsed() {
    return this.#ogResponse.bodyUsed;
  }

  get headers() {
    return this.#ogResponse.headers;
  }

  get ok() {
    return this.#ogResponse.ok;
  }

  get redirected() {
    return this.#ogResponse.redirected;
  }

  get status() {
    return this.#ogResponse.status;
  }

  get statusText() {
    return this.#ogResponse.statusText;
  }

  get type() {
    return this.#ogResponse.type;
  }

  get url() {
    return this.#ogResponse.url;
  }

  text() {
    return withTeardown<string>(this.#ogResponse.text(), this as any);
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    return withTeardown<ArrayBuffer>(
      this.#ogResponse.arrayBuffer(),
      this as any,
    );
  }

  blob(): Promise<Blob> {
    return withTeardown<Blob>(this.#ogResponse.blob(), this as any);
  }

  clone(): Response {
    const newResponse = this.#ogResponse.clone();
    return new ResponseWrapper(newResponse, this.teardownRef);
  }

  formData(): Promise<FormData> {
    return withTeardown<FormData>(this.#ogResponse.formData(), this as any);
  }

  json(): Promise<any> {
    return withTeardown(this.#ogResponse.json(), this as any);
  }

  /**
   * Abort body streams using the AbortController signal
   * and triggering teardown process for each body.
   */
  async responseWrapperTeardownFunction() {
    this.abortController.abort();
    for (const body of this.registeredBodyObjects) {
      await body.teardownFunction();
    }
    this.registeredBodyObjects.clear();
  }
}
