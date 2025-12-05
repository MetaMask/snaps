import { enums, is, literal } from '@metamask/superstruct';

import { uri } from './uri';

describe('uri', () => {
  it.each([
    'npm:foo-bar',
    'http://asd.com',
    'https://dsa.com/foo',
    'http://dsa.com/foo?asd=5&dsa=6#bar',
    'npm:foo/bar?asd',
    'local:asd.com',
    'http://asd@asd.com',
    'http://asd:foo@asd.com',
  ])('validates correct uri', (value) => {
    expect(is(value, uri())).toBe(true);
  });

  it.each([5, 'asd', undefined, null, {}, uri, URL])(
    'invalidates invalid uri',
    (value) => {
      expect(is(value, uri())).toBe(false);
    },
  );

  it('takes additional constraints', () => {
    const constraints = {
      protocol: enums(['foo:', 'bar:']),
      hash: literal('#hello'),
    };
    const struct = uri(constraints);
    expect(is('foo://asd.com/#hello', struct)).toBe(true);
    expect(is('foo://asd.com/', struct)).toBe(false);
    expect(is('http://asd.com/#hello', struct)).toBe(false);
  });
});
