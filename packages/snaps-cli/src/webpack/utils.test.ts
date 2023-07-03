import { dim } from 'chalk';

import { getMockConfig } from '../test-utils';
import { getDevTool, getProgressHandler } from './utils';

describe('getDevTool', () => {
  it('returns `inline-source-map` when `sourceMap` is `inline`', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.ts',
      sourceMap: 'inline',
    });

    expect(getDevTool(config)).toBe('inline-source-map');
  });

  it('returns `source-map` when `sourceMap` is `true`', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.ts',
      sourceMap: true,
    });

    expect(getDevTool(config)).toBe('source-map');
  });

  it('returns `false` when `sourceMap` is `false`', () => {
    const config = getMockConfig('webpack', {
      input: 'src/index.ts',
      sourceMap: false,
    });

    expect(getDevTool(config)).toBe(false);
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
