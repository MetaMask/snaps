import { assert } from 'superstruct';

import { FormStateStruct, InterfaceStateStruct } from './interface';

describe('formStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() => assert({ foo: 'bar' }, FormStateStruct)).not.toThrow();
  });
});

describe('interfaceStateStruct', () => {
  it('passes for a valid form state', () => {
    expect(() =>
      assert({ test: { bar: 'baz' }, foo: 'bar' }, InterfaceStateStruct),
    ).not.toThrow();
  });
});
