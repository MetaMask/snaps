import { describe, expect, it } from 'vitest';

import { snapsVitestPreset } from './config';

describe('snapsVitestPreset', () => {
  it('sets a test timeout', () => {
    expect(snapsVitestPreset.testTimeout).toBe(30_000);
  });
});
