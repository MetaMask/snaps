import { mergeValue } from './utils';

describe('mergeValue', () => {
  it('merges a value outside of a form', () => {
    const state = { foo: 'bar' };

    const result = mergeValue(state, 'foo', 'baz');

    expect(result).toStrictEqual({ foo: 'baz' });
  });

  it('merges a value inside of a form', () => {
    const state = { foo: { bar: 'baz' } };

    const result = mergeValue(state, 'bar', 'test', 'foo');

    expect(result).toStrictEqual({ foo: { bar: 'test' } });
  });
});
