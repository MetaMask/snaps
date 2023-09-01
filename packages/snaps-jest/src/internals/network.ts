import { JSON_RPC_ENDPOINT } from '@metamask/snaps-simulator';
import { createModuleLogger, UnsafeJsonStruct } from '@metamask/utils';
import type { Page, HTTPRequest } from 'puppeteer';
import type { Infer, Struct } from 'superstruct';
import {
  assign,
  boolean,
  create,
  defaulted,
  number,
  object,
  optional,
  record,
  regexp,
  string,
  union,
  unknown,
  func,
} from 'superstruct';

import type { DeepPartial } from '../types';
import { rootLogger } from './logger';

/**
 * The default headers to use for mocked responses. These headers are used to
 * enable CORS.
 */
const DEFAULT_HEADERS = {
  /* eslint-disable @typescript-eslint/naming-convention */
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
  /* eslint-enable @typescript-eslint/naming-convention */
};

const log = createModuleLogger(rootLogger, 'network');

export type Unmock = () => Promise<void>;

export type Mock = {
  /**
   * A function that can be used to unmock the URL.
   */
  unmock: Unmock;
};

/**
 * A function that can return `true` if the given request should be mocked, or
 * false if not.
 *
 * @param request - The request to check.
 * @returns Whether to mock the request.
 */
export type ConditionFunction = (request: HTTPRequest) => boolean;

const MockOptionsBaseStruct = object({
  response: defaulted(
    object({
      status: defaulted(number(), 200),
      headers: defaulted(record(string(), unknown()), DEFAULT_HEADERS),
      contentType: defaulted(string(), 'text/plain'),

      // Note: We default to a newline here, because the fetch request never
      // resolves if the body is empty.
      body: defaulted(string(), '\n'),
    }),
    {},
  ),
});

const MockOptionsUrlStruct = object({
  url: union([string(), regexp()]),
  partial: optional(boolean()),
});

const MockOptionsConditionStruct = object({
  condition: func() as unknown as Struct<ConditionFunction, null>,
});

export const MockOptionsStruct = union([
  assign(MockOptionsBaseStruct, MockOptionsUrlStruct),
  assign(MockOptionsBaseStruct, MockOptionsConditionStruct),
]);

/**
 * The options for the network mocking.
 *
 * @property url - The URL to mock. If a string is provided, the URL will be
 * matched exactly. If a RegExp is provided, the URL will be matched against it.
 * This option is incompatible with the `condition` option.
 * @property partial - If enabled, the request will be mocked if the URL starts
 * with the given URL. This option is ignored if a RegExp is provided to the
 * `url` option. This option is incompatible with the `condition` option.
 * @property condition - A function which gets the {@link HTTPRequest} as
 * parameter and returns a boolean to indicate whether the response should be
 * mocked or not. This option is incompatible with the `url` and `partial`
 * options.
 * @property response - The response to send for the request.
 * @property response.status - The status code to send for the response.
 * Defaults to `200`.
 * @property response.headers - The headers to send for the response. Defaults
 * to headers that enable CORS.
 * @property response.contentType - The content type to send for the response.
 * Defaults to `text/plain`.
 */
export type MockOptions = Infer<typeof MockOptionsStruct>;

/**
 * Check if the given URL matches the given request, or if the condition
 * function returns `true`.
 *
 * @param request - The request to check.
 * @param options - The options for the network mocking.
 * @returns Whether the URL matches the request.
 */
function matches(request: HTTPRequest, options: MockOptions) {
  if ('url' in options) {
    const { url, partial } = options;
    if (typeof url === 'string') {
      if (partial) {
        return request.url().startsWith(url);
      }

      return url === request.url();
    }

    return url.test(request.url());
  }

  const { condition } = options;
  return condition(request);
}

/**
 * Enable network mocking for the given page, and all its sub-frames.
 *
 * @param page - The page to enable network mocking on.
 * @param options - The options for the network mocking.
 * @returns A {@link Mock} object, with an `unmock` function.
 */
export async function mock(
  page: Page,
  options: DeepPartial<MockOptions>,
): Promise<Mock> {
  await page.setRequestInterception(true);

  const parsedOptions = create(options, MockOptionsStruct);

  /**
   * The mock handler.
   *
   * @param request - The request to handle.
   */
  function handler(request: HTTPRequest) {
    // If the request is already handled, Puppeteer will throw an error if we
    // try to continue the request.
    if (request.isInterceptResolutionHandled()) {
      return;
    }

    if (!matches(request, parsedOptions)) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      request.continue();
      return;
    }

    log('Mocking request to %s', request.url());

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    request.respond(parsedOptions.response);
  }

  /**
   * Unmock the page.
   */
  async function unmock() {
    await page.setRequestInterception(false);
    page.off('request', handler);
  }

  page.on('request', handler);

  return {
    unmock,
  };
}

const MockJsonRpcOptionsStruct = object({
  method: string(),
  result: UnsafeJsonStruct,
});

export type MockJsonRpcOptions = Infer<typeof MockJsonRpcOptionsStruct>;

/**
 * Mock an Ethereum JSON-RPC request. This intercepts all requests to the
 * Ethereum provider, and returns the `result` instead.
 *
 * @param page - The page to enable network JSON-RPC mocking on.
 * @param options - The options for the JSON-RPC mock.
 * @param options.method - The JSON-RPC method to mock. Any other methods will be
 * forwarded to the provider.
 * @param options.result - The JSON response to return.
 * @returns A {@link Mock} object, with an `unmock` function.
 */
export async function mockJsonRpc(
  page: Page,
  { method, result }: MockJsonRpcOptions,
) {
  return await mock(page, {
    condition: (request: HTTPRequest) => {
      if (request.url() !== JSON_RPC_ENDPOINT) {
        return false;
      }

      const body = request.postData();
      if (!body) {
        return false;
      }

      try {
        const json = JSON.parse(body);
        return json.method === method;
      } catch (error) {
        log(
          `Unable to mock "${method}" request to Ethereum provider: %s`,
          error.message,
        );
        return false;
      }
    },
    response: {
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        result,
      }),
    },
  });
}
