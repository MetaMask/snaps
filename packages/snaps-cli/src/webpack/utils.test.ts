import { getMockConfig } from '../test-utils';
import { getDevTool } from './utils';

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
