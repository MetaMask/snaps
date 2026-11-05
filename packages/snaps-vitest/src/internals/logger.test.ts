import { describe, expect, it } from 'vitest';

import { rootLogger } from './logger';

describe('rootLogger', () => {
  it('is a function', () => {
    expect(rootLogger).toBeInstanceOf(Function);
  });
});
