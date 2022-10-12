import { sortParamKeys } from './sortParams';

describe('getSortedParams', () => {
  it('will return an empty array if params is undefined', () => {
    const method = ['foo', 'bar'];
    expect(sortParamKeys(method, undefined)).toStrictEqual([]);
  });

  it('will return the params if provided with a params argument', () => {
    const method = ['foo', 'bar'];
    const params = ['dog', 'cat'];
    expect(sortParamKeys(method, params)).toStrictEqual(['dog', 'cat']);
  });

  it('will return a by position-sorted array of params', () => {
    const method = ['bar', 'foo'];
    const params = { foo: 'val1', bar: 'val2' };
    expect(sortParamKeys(method, params)).toStrictEqual(['val2', 'val1']);
  });
});
