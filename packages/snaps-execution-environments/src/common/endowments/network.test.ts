import fetchMock from 'jest-fetch-mock';

import network, { ResponseWrapper } from './network';

describe('Network endowments', () => {
  beforeAll(() => {
    globalThis.harden = (value) => value;
  });

  const factoryOptions = { notify: jest.fn() };

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
      const { fetch } = network.factory(factoryOptions);
      const result = await (await fetch('foo.com')).text();
      expect(result).toStrictEqual(RESULT);
    });

    it('send notification about outbound request and response', async () => {
      const notify = jest.fn();
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));
      const { fetch } = network.factory({ notify });
      const result = await (await fetch('foo.com')).text();
      expect(result).toStrictEqual(RESULT);
      expect(notify).toHaveBeenNthCalledWith(1, {
        method: 'OutboundRequest',
        params: { source: 'fetch' },
      });
      expect(notify).toHaveBeenNthCalledWith(2, {
        method: 'OutboundResponse',
        params: { source: 'fetch' },
      });
      expect(notify).toHaveBeenNthCalledWith(3, {
        method: 'OutboundRequest',
        params: { source: 'fetch' },
      });
      expect(notify).toHaveBeenNthCalledWith(4, {
        method: 'OutboundResponse',
        params: { source: 'fetch' },
      });
      expect(notify).toHaveBeenCalledTimes(4);
    });

    it('can use AbortController normally', async () => {
      fetchMock.mockOnce(async () => 'FAIL');

      const { fetch } = network.factory(factoryOptions);

      const controller = new AbortController();

      const fetchPromise = fetch('foo.com', { signal: controller.signal });
      controller.abort();
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
      fetchMock.mockOnce(async () => 'Resolved');

      const { fetch, teardownFunction } = network.factory(factoryOptions);
      const ErrorProxy = jest
        .fn()
        .mockImplementation((reason) => Error(reason));

      fetch('foo.com')
        .then(() => {
          throw new ErrorProxy('SHOULD_NOT_BE_REACHED');
        })
        .catch(() => {
          throw new ErrorProxy('SHOULD_NOT_BE_REACHED');
        })
        .catch((error) => console.log(error));

      const teardownPromise = teardownFunction();
      await teardownPromise;
      await new Promise((resolve) => setTimeout(() => resolve('Resolved'), 0));

      expect(ErrorProxy).not.toHaveBeenCalled();
    });

    it('should not expose catch after teardown has been called', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      fetchMock.mockReject(new Error('Failed to fetch.'));

      const { fetch, teardownFunction } = network.factory(factoryOptions);

      fetch('foo.com').catch(() => {
        console.log('Jailbreak');
      });

      await teardownFunction();

      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('trace headers', () => {
    const TRACEPARENT =
      '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
    const ORIGINS = ['https://metamask.io'];

    beforeEach(() => {
      fetchMock.enableMocks();
      fetchMock.resetMocks();
      fetchMock.mockResponse('OK');
    });

    afterEach(() => {
      fetchMock.disableMocks();
    });

    const getSentHeaders = () => {
      const [input, init] = fetchMock.mock.calls[0];
      return new Headers(
        init?.headers ?? (input instanceof Request ? input.headers : undefined),
      );
    };

    it('attaches `traceparent` and `baggage` from the trace context', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({
          traceparent: TRACEPARENT,
          baggage: 'a=b',
          origins: ORIGINS,
        }),
      });

      await fetch('https://metamask.io', { headers: { 'X-Foo': 'bar' } });

      const headers = getSentHeaders();
      expect(headers.get('traceparent')).toBe(TRACEPARENT);
      expect(headers.get('baggage')).toBe('a=b');
      expect(headers.get('x-foo')).toBe('bar');
    });

    it('attaches only `traceparent` when there is no baggage', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({ traceparent: TRACEPARENT, origins: ORIGINS }),
      });

      await fetch('https://metamask.io');

      const headers = getSentHeaders();
      expect(headers.get('traceparent')).toBe(TRACEPARENT);
      expect(headers.has('baggage')).toBe(false);
    });

    it('keeps the headers of a `Request` input', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({ traceparent: TRACEPARENT, origins: ORIGINS }),
      });

      await fetch(
        new Request('https://metamask.io', { headers: { 'X-Foo': 'bar' } }),
      );

      const headers = getSentHeaders();
      expect(headers.get('traceparent')).toBe(TRACEPARENT);
      expect(headers.get('x-foo')).toBe('bar');
    });

    it('does not overwrite trace headers set by the Snap', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({
          traceparent: TRACEPARENT,
          baggage: 'a=b',
          origins: ORIGINS,
        }),
      });

      const ownTraceparent =
        '00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-00';
      await fetch('https://metamask.io', {
        headers: { traceparent: ownTraceparent },
      });

      const headers = getSentHeaders();
      expect(headers.get('traceparent')).toBe(ownTraceparent);
      expect(headers.has('baggage')).toBe(false);
    });

    it('does not overwrite `baggage` set by the Snap', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({
          traceparent: TRACEPARENT,
          baggage: 'a=b',
          origins: ORIGINS,
        }),
      });

      await fetch('https://metamask.io', { headers: { baggage: 'c=d' } });

      const headers = getSentHeaders();
      expect(headers.get('traceparent')).toBe(TRACEPARENT);
      expect(headers.get('baggage')).toBe('c=d');
    });

    it('attaches nothing when there is no trace context', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => undefined,
      });

      await fetch('https://metamask.io');

      const headers = getSentHeaders();
      expect(headers.has('traceparent')).toBe(false);
      expect(headers.has('baggage')).toBe(false);
    });

    it('attaches nothing to an origin that is not allowed', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({
          traceparent: TRACEPARENT,
          baggage: 'a=b',
          origins: ORIGINS,
        }),
      });

      await fetch('https://metamask.io.example.com/api');

      const headers = getSentHeaders();
      expect(headers.has('traceparent')).toBe(false);
      expect(headers.has('baggage')).toBe(false);
    });

    it('attaches nothing to a `Request` for an origin that is not allowed', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({ traceparent: TRACEPARENT, origins: ORIGINS }),
      });

      await fetch(new Request('http://metamask.io'));

      expect(getSentHeaders().has('traceparent')).toBe(false);
    });

    it('attaches nothing when the URL cannot be parsed', async () => {
      const { fetch } = network.factory({
        ...factoryOptions,
        getTraceContext: () => ({ traceparent: TRACEPARENT, origins: ORIGINS }),
      });

      await fetch('metamask.io');

      expect(getSentHeaders().has('traceparent')).toBe(false);
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

      const { fetch } = network.factory(factoryOptions);
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

      const { fetch } = network.factory(factoryOptions);
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      expect(await result.arrayBuffer()).toBeDefined();
    });

    it('should return when blob is called', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory(factoryOptions);
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      const blobResult = await result.blob();
      expect(blobResult).toBeDefined();
      expect(await blobResult.text()).toBe(RESULT);
    });

    it('should return when bytes is called', async () => {
      const onStart = jest.fn();
      const onFinish = jest.fn();
      const bytes = new TextEncoder().encode('OK');
      const wrapper = new ResponseWrapper(
        { bytes: jest.fn().mockResolvedValue(bytes) } as unknown as Response,
        { lastTeardown: 0 },
        onStart,
        onFinish,
      );

      expect(await wrapper.bytes()).toBe(bytes);
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('should return when formData is called', async () => {
      const onStart = jest.fn();
      const onFinish = jest.fn();
      const formData = new FormData();
      formData.append('foo', 'bar');
      const wrapper = new ResponseWrapper(
        {
          formData: jest.fn().mockResolvedValue(formData),
        } as unknown as Response,
        { lastTeardown: 0 },
        onStart,
        onFinish,
      );

      expect(await wrapper.formData()).toBe(formData);
      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onFinish).toHaveBeenCalledTimes(1);
    });

    it('should clone the body using the wrapper', async () => {
      const RESULT = 'OK';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch, Response } = network.factory(factoryOptions);
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      const clonedResult = result.clone();
      expect(clonedResult).toBeDefined();
      expect(await clonedResult.text()).toBe(RESULT);
      expect(clonedResult).toBeInstanceOf(Response);
      expect(clonedResult).toBeInstanceOf(ResponseWrapper);
    });

    it('should return when json is called', async () => {
      const RESULT = '{}';
      fetchMock.mockOnce(async () => Promise.resolve(RESULT));

      const { fetch } = network.factory(factoryOptions);
      const result = await fetch('foo.com');

      expect(result.bodyUsed).toBe(false);
      expect(await result.json()).toStrictEqual({});
    });
  });

  it('throws when notify is not provided', () => {
    expect(() => network.factory()).toThrow(
      'The "notify" callback is required by the network endowment factory.',
    );
  });
});
