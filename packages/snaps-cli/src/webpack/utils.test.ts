import { getMockConfig } from '@metamask/snaps-cli/test-utils';
import { dim } from 'chalk';

import { getDefaultLoader, getDevTool, getProgressHandler } from './utils';

describe('getDefaultLoader', () => {
  it('returns the Browserify loader if `legacy` is set', () => {
    const config = getMockConfig('browserify');
    expect(getDefaultLoader(config)).toStrictEqual({
      loader: expect.stringContaining('browserify'),
      options: config.legacy,
    });
  });

  it('returns the SWC loader if `legacy` is not set', () => {
    const config = getMockConfig('webpack');
    expect(getDefaultLoader(config)).toStrictEqual({
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
