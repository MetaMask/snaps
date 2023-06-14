import { is } from 'superstruct';

import { enumValue } from './enum';

describe('enumValue', () => {
  it('validates an enum value', () => {
    enum Foo {
      Bar = 'bar',
      Baz = 'baz',
    }

    const struct = enumValue(Foo.Bar);

    expect(is('bar', struct)).toBe(true);
    expect(is('baz', struct)).toBe(false);
    expect(is(Foo.Bar, struct)).toBe(true);
    expect(is(Foo.Baz, struct)).toBe(false);
  });
});
