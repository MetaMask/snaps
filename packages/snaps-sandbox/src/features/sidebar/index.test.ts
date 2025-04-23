import { describe, it, expect } from 'vitest';

import * as index from '.';

describe('index', () => {
  it('exports all components', () => {
    expect(Object.keys(index)).toMatchInlineSnapshot(`
      [
        "Sidebar",
      ]
    `);
  });
});
