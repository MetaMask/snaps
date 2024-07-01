import { is } from '@metamask/superstruct';

import { svg } from './svg';

describe('svg', () => {
  it('validates an SVG string', () => {
    expect(is('<svg />', svg())).toBe(true);
    expect(is('<svg></svg>', svg())).toBe(true);
    expect(is('<foo/>', svg())).toBe(false);
    expect(is(1, svg())).toBe(false);
  });
});
