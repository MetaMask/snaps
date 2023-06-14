import { createModuleLogger } from '@metamask/utils';
import { Page, HTTPRequest } from 'puppeteer';
import {
  boolean,
  create,
  defaulted,
  Infer,
  number,
  object,
  optional,
  record,
  regexp,
  string,
  union,
  unknown,
} from 'superstruct';

import { DeepPartial } from '../types';
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
   * The URL that was mocked.
   */
  url: string | RegExp;

  /**
   * A function that can be used to unmock the URL.
   */
  unmock: Unmock;
};

export const MockOptionsStruct = object({
  url: union([string(), regexp()]),
  partial: optional(boolean()),
  response: defaulted(
    object({
      status: defaulted(number(), 200),
      headers: defaulted(record(string(), unknown()), DEFAULT_HEADERS),
      contentType: defaulted(string(), 'text/plain'),
      body: defaulted(string(), ''),
    }),
    {},
  ),
});

/**
 * The options for the network mocking.
 *
 * @property url - The URL to mock. If a string is provided, the URL will be
 * matched exactly. If a RegExp is provided, the URL will be matched against it.
 * @property partial - If enabled, the request will be mocked if the URL starts
 * with the given URL. This option is ignored if a RegExp is provided to the
 * `url` option.
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
 * Check if the given URL matches the given request.
 *
 * @param request - The request to check.
 * @param options - The options for the network mocking.
 * @param options.url - The URL to mock. If a string is provided, the URL will
 * be matched exactly. If a RegExp is provided, the URL will be matched against
 * it.
 * @param options.partial - If enabled, the request will be mocked if the URL
 * starts with the given URL. This option is ignored if a RegExp is provided to
 * the `url` option.
 * @returns Whether the URL matches the request.
 */
function matches(request: HTTPRequest, { url, partial }: MockOptions) {
  if (typeof url === 'string') {
    if (partial) {
      return request.url().startsWith(url);
    }

    return url === request.url();
  }

  return url.test(request.url());
}

/**
 * Enable network mocking for the given page, and all its sub-frames.
 *
 * @param page - The page to enable network mocking on.
 * @param options - The options for the network mocking.
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
    url: parsedOptions.url,
    unmock,
  };
}
