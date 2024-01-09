import { assert } from 'superstruct';

import { formStateStruct, interfaceStateStruct } from './interface';

describe('formStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() => assert({ foo: 'bar' }, formStateStruct)).not.toThrow();
  });
});

describe('interfaceStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() =>
      assert({ test: { bar: 'baz' }, foo: 'bar' }, interfaceStateStruct),
    ).not.toThrow();
  });
});
