import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { dim } from 'chalk';
import type { ProcessedWebpackConfig } from 'src/config';

import {
  WEBPACK_FALLBACKS,
  getBrowserslistTargets,
  getDefaultLoader,
  getDevTool,
  getFallbacks,
  getProgressHandler,
  pluralize,
} from './utils';

describe('getDefaultLoader', () => {
  it('returns the Browserify loader if `legacy` is set', async () => {
    const config = getMockConfig('browserify');
    expect(await getDefaultLoader(config)).toStrictEqual({
      loader: expect.stringContaining('browserify'),
      options: config.legacy,
    });
  });

  it('returns the SWC loader if `legacy` is not set', async () => {
    const config = getMockConfig('webpack');
    expect(await getDefaultLoader(config)).toStrictEqual({
      loader: 'swc-loader',
      options: expect.any(Object),
    });
  });
});

describe('getDevTool', () => {
  it('returns `inline-source-map` when `sourceMap` is `inline`', () => {
    expect(getDevTool('inline')).toBe('inline-source-map');
  });

  it('returns `source-map` when `sourceMap` is `true`', () => {
    expect(getDevTool(true)).toBe('source-map');
  });

  it('returns `false` when `sourceMap` is `false`', () => {
    expect(getDevTool(false)).toBe(false);
  });
});

describe('getProgressHandler', () => {
  it('returns a function that updates the spinner text', () => {
    const spinner = {
      text: '',
    };

    // @ts-expect-error - Partial spinner object.
    const progressHandler = getProgressHandler(spinner, 'Building');

    progressHandler(0.5);
    expect(spinner.text).toBe(`Building ${dim('(50%)')}`);

    progressHandler(0.75);
    expect(spinner.text).toBe(`Building ${dim('(75%)')}`);
  });

  it('works without spinner', () => {
    const progressHandler = getProgressHandler();
    expect(() => progressHandler(0.5)).not.toThrow();
  });
});

describe('getBrowserslistTargets', () => {
  it('returns the default targets', async () => {
    const targets = await getBrowserslistTargets();
    expect(targets).toMatchInlineSnapshot(`
      [
        "chrome >= 90",
        "firefox >= 91",
      ]
    `);
  });
});

describe('pluralize', () => {
  it('pluralizes a word, based on the count', () => {
    expect(pluralize(0, 'test')).toBe('tests');
    expect(pluralize(1, 'test')).toBe('test');
    expect(pluralize(2, 'test')).toBe('tests');
  });

  it('returns the plural form if `plural` is set', () => {
    expect(pluralize(0, 'test', 'problems')).toBe('problems');
    expect(pluralize(1, 'test', 'problems')).toBe('test');
    expect(pluralize(2, 'test', 'problems')).toBe('problems');
  });
});

describe('getFallbacks', () => {
  it('disables all fallbacks if polyfills is set to false', () => {
    const fallbacks = getFallbacks(false);

    Object.keys(fallbacks).map((name) => expect(fallbacks[name]).toBe(false));
  });

  it('requires all the polyfills if polyfills is set to true', () => {
    const fallbacks = getFallbacks(true);

    Object.keys(fallbacks).map((name) =>
      expect(WEBPACK_FALLBACKS[name as keyof typeof WEBPACK_FALLBACKS]).toBe(
        WEBPACK_FALLBACKS[name as keyof typeof WEBPACK_FALLBACKS],
      ),
    );
  });

  it('disable or enable the polyfill if a polyfill config is passed', () => {
    const config = {
      buffer: true,
      crypto: false,
    } as ProcessedWebpackConfig['polyfills'];

    const fallbacks = getFallbacks(config);

    expect(fallbacks.buffer).toBe(WEBPACK_FALLBACKS.buffer);
    expect(fallbacks.crypto).toBe(false);
  });

  it("sets the fallbacks that we don't polyfill to false", () => {
    const fallbacks = getFallbacks(true);

    expect(fallbacks.fs).toBe(false);
  });
});
