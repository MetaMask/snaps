import { join, resolve } from 'path';

import { getRelativePath } from './path';

describe('getRelativePath', () => {
  it('returns the relative path from the current working directory to the given absolute path', () => {
    const absolutePath = resolve(process.cwd(), 'foo', 'bar');

    expect(getRelativePath(absolutePath)).toBe(join('foo', 'bar'));
  });
});
