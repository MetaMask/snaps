import { enums, is, literal } from '@metamask/superstruct';

import { isValidUrl, uri } from './types';

describe.each([
  isValidUrl,
  (value: unknown, opts?: any) => is(value, uri(opts)),
])('uri', (testedFn) => {
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
    expect(testedFn(value)).toBe(true);
  });

  it.each([5, 'asd', undefined, null, {}, uri, URL])(
    'invalidates invalid uri',
    (value) => {
      expect(testedFn(value)).toBe(false);
    },
  );

  it('takes additional constraints', () => {
    const constraints = {
      protocol: enums(['foo:', 'bar:']),
      hash: literal('#hello'),
    };
    expect(testedFn('foo://asd.com/#hello', constraints)).toBe(true);
    expect(testedFn('foo://asd.com/', constraints)).toBe(false);
    expect(testedFn('http://asd.com/#hello', constraints)).toBe(false);
  });
});
