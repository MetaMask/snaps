import fetchMock from 'jest-fetch-mock';

import network from './network';

describe('Network endowments', () => {
  beforeAll(() => {
    globalThis.harden = (value) => value;
  });

  describe('fetch', () => {
    beforeEach(() => {
      fetchMock.enableMocks();
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    it('fetches and reads body', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));
      const { fetch } = network.factory();
      const result = await (await fetch('foo.com')).text();
      expect(result).toStrictEqual(RESULT);
    });

    it('can use AbortController normally', async () => {
      let resolve: ((result: string) => void) | null = null;
      fetchMock.mockOnce(
        async () =>
          new Promise((_resolve) => {
            resolve = _resolve;
          }),
      );

      const { fetch } = network.factory();

      const controller = new AbortController();

      const fetchPromise = fetch('foo.com', { signal: controller.signal });
      controller.abort();
      (resolve as any)('FAIL');
      await expect(fetchPromise).rejects.toThrow('The operation was aborted');
    });

    /**
     * Fetch has multiple implementations, Node v18, node-fetch, Browsers, mock fetch, JSDOM, etc.
     * And their actual behavior varies. For example node-fetch doesn't support ReadableStream and
     * passes Buffer or node stream with different API as response.body in browser.
     * Testing this would test node-fetch implementation instead of actual user use-case
     * Thus it's not actually written
     */
    it.todo('can be torn down during body read');

    /**
     * Node doesn't support AbortSignal.reason property, thus we can't check if it's actually passed
     */
    it.todo('reason from AbortController.abort() is passed down');

    it('should not expose then or catch after teardown has been called', async () => {
      let fetchResolve: ((result: string) => void) | null = null;
      fetchMock.mockOnce(
        async () => new Promise((resolve) => (fetchResolve = resolve)),
      );

      const { fetch, teardownFunction } = network.factory();
      const ErrorProxy = jest
        .fn()
        .mockImplementation((reason) => Error(reason));

      // eslint-disable-next-line jest/valid-expect-in-promise
      fetch('foo.com')
        .then(() => {
          throw new ErrorProxy('SHOULD_NOT_BE_REACHED');
        })
        .catch(() => {
          throw new ErrorProxy('SHOULD_NOT_BE_REACHED');
        })
        .catch((error) => console.log(error));

      const teardownPromise = teardownFunction();
      (fetchResolve as any)('Resolved');
      await teardownPromise;
      await new Promise((resolve) => setTimeout(() => resolve('Resolved'), 0));

      expect(ErrorProxy).not.toHaveBeenCalled();
    });

    it('should not expose catch after teardown has been called', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      fetchMock.mockReject(new Error('Failed to fetch.'));

      const { fetch, teardownFunction } = network.factory();

      // eslint-disable-next-line jest/valid-expect-in-promise
      fetch('foo.com').catch(() => {
        console.log('Jailbreak');
      });

      await teardownFunction();

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('ResponseWrapper', () => {
    beforeEach(() => {
      fetchMock.enableMocks();
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    it('should return for each of the Response methods', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result).toBeDefined();
      expect(result.bodyUsed).toBe(false);
      expect(await result.text()).toBe(RESULT);
      expect(result.body).toBeDefined();
      expect(result.bodyUsed).toBe(true);
      expect(result.headers).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.redirected).toBe(false);
      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      // This seems not to be set internally
      expect(result.type).toBeUndefined();
      // This seems not to be set internally
      expect(result.url).toBe('');
    });

    it('should return when arrayBuffer is called', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      expect(await result.arrayBuffer()).toBeDefined();
    });

    it('should return when blob is called', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      const blobResult = await result.blob();
      expect(blobResult).toBeDefined();
      expect(await blobResult.text()).toBe(RESULT);
    });

    it('should clone the body using the wrapper', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      const clonedResult = result.clone();
      expect(clonedResult).toBeDefined();
      expect(await clonedResult.text()).toBe(RESULT);
      expect(clonedResult).not.toBeInstanceOf(Response);
    });

    it('should return when json is called', async () => {
      const RESULT = '{}';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory();
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      expect(await result.json()).toStrictEqual({});
    });
  });
});
