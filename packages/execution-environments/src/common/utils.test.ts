import {
  ReadableStream,
  TransformStream,
  TextDecoderStream,
  WritableStream,
} from 'node:stream/web';
import fetchMock from 'jest-fetch-mock';
import {
  constructError,
  convertBody,
  ResponseBodyStreamWrapper,
} from './utils';

describe('Utils', () => {
  describe('constructError', () => {
    it('will return the original error if it is an error', () => {
      const err = constructError(new Error('unhandledrejection'));
      expect(err).toStrictEqual(new Error('unhandledrejection'));
    });

    it('will return undefined if it is not passed an Error or a string', () => {
      const err = constructError(undefined);
      expect(err).toBeUndefined();
    });

    it('will return an Error object with the message of the original error if it was a string', () => {
      const err = constructError('some reason');
      expect(err?.message).toStrictEqual('some reason');
    });
  });

  describe('convert body', () => {
    it('will convert buffer to ReadableStream', () => {
      const bufferBody = Buffer.from([1, 2, 3]);
      const convertedBody = convertBody(bufferBody);

      expect(convertedBody).toBeInstanceOf(ReadableStream);
    });

    it('will return ReadableStream when ReadableStream is provided', () => {
      const bufferBody = Buffer.from([1, 2, 3]);
      const convertedBuffer = convertBody(bufferBody);
      const convertedReadableStream = convertBody(convertedBuffer);

      expect(convertedReadableStream).toBeInstanceOf(ReadableStream);
    });
  });

  describe('ResponseBodyStreamWrapper', () => {
    let bodyObject: ReadableStream;
    const fetchResultMock = 'ok';

    beforeEach(async () => {
      fetchMock.enableMocks();
      fetchMock.mockOnce(async () => fetchResultMock);
      const result = await fetch('foo.com');
      bodyObject = convertBody(result.body);
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    it('returns wrapped ReadableStream after pipeThrough', async () => {
      const abortController = new AbortController();
      abortController.signal.addEventListener(
        'abort',
        () => {
          abortController.abort('aborting...');
        },
        { once: true },
      );
      const wrappedBody = new ResponseBodyStreamWrapper(
        bodyObject,
        abortController,
      );
      const { readable, writable } = new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk.toUpperCase());
        },
      });
      const rsAfterPipe = wrappedBody
        .pipeThrough(new TextDecoderStream())
        .pipeThrough({ readable, writable });

      expect(rsAfterPipe).toBeInstanceOf(ResponseBodyStreamWrapper);

      const result = await rsAfterPipe.getReader().read();
      expect(result.value).toStrictEqual(fetchResultMock.toUpperCase());
    });

    it('resolves pipeTo promise and writer has been used', async () => {
      const abortController = new AbortController();
      const wrappedBody = new ResponseBodyStreamWrapper(
        bodyObject,
        abortController,
      );

      const writeSpy = jest.fn();
      const writableStream = new WritableStream({
        async write(chunk) {
          // Called upon writer.write()
          writeSpy(chunk);
          // Wait for next write.
          await new Promise((resolve) =>
            setTimeout(() => {
              resolve(chunk);
            }, 100),
          );
        },
      });

      await wrappedBody.pipeTo(writableStream);

      expect(writeSpy).toHaveBeenCalled();
    });

    it('returns a pair of ResponseBodyStreamWrapper (ReadableStream) when tee() is called', () => {
      const abortController = new AbortController();
      const wrappedBody = new ResponseBodyStreamWrapper(
        bodyObject,
        abortController,
      );

      const [streamOne, streamTwo] = wrappedBody.tee();

      expect(streamOne).toBeInstanceOf(ResponseBodyStreamWrapper);
      expect(streamTwo).toBeInstanceOf(ResponseBodyStreamWrapper);
    });

    it('returns values of a readable stream', async () => {
      const abortController = new AbortController();
      const wrappedBody = new ResponseBodyStreamWrapper(
        bodyObject,
        abortController,
      );

      const valueIterator = wrappedBody.values();
      const readValue = await valueIterator.next();

      expect(readValue.value).toBeInstanceOf(Buffer);
      expect(readValue.value.toString()).toBe(fetchResultMock);
    });
  });
});
